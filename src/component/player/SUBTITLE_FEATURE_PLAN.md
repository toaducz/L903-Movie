# Kế hoạch Triển khai Tính năng Phụ đề Song ngữ (Bilingual Subtitles)

## 1. Mục tiêu (Objectives)

- Cho phép người dùng tải lên và hiển thị phụ đề (SRT/VTT) trực tiếp trên video player.
- Hỗ trợ hiển thị hai ngôn ngữ cùng lúc (Song ngữ) với style tách biệt.
- **[Critical]** Xử lý triệt để tình trạng lệch phụ đề do luồng video bị chèn quảng cáo từ server (SSAI).
- Giữ nguyên kiến trúc **Stateless** cho backend: Toàn bộ quá trình parse, đồng bộ thời gian và lưu trữ file sẽ được thực hiện 100% ở Client-side (trình duyệt).

## 2. Kiến trúc Luồng dữ liệu (Data Flow)

1.  **Input:** User chọn 1 hoặc 2 file `.srt` từ thiết bị.
2.  **Processing:** Trình duyệt parse file SRT thành mảng JSON objects. Nếu có 2 file, thuật toán sẽ gộp (merge) chúng lại dựa trên các mốc thời gian.
3.  **Storage:** Lưu mảng JSON vào `IndexedDB` để tái sử dụng cho các lần xem sau mà không tốn bộ nhớ lưu file cứng.
4.  **Playback Sync:** Tại mỗi frame (`requestAnimationFrame`), tính toán `realMovieTime` bằng cách lấy `currentTime` của video trừ đi tổng thời gian quảng cáo đã phát.
5.  **Render:** Ánh xạ `realMovieTime` vào mảng JSON phụ đề để tìm và render câu sub tương ứng lên Overlay UI.

---

## 3. Các Giai đoạn Triển khai (Phases)

### Phase 1: Mở rộng State và UI Overlay (Component Level)

Thêm các biến trạng thái vào `VideoPlayer.tsx` để quản lý dữ liệu hiển thị.

- **States cần thêm:**
  ```typescript
  interface SubtitleCue {
    start: number
    end: number
    text1: string
    text2?: string
  }
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([])
  const [activeSub, setActiveSub] = useState<SubtitleCue | null>(null)
  const [manualOffset, setManualOffset] = useState<number>(0) // Đơn vị: giây
  ```
- **UI Overlay:** Thêm một layer `div` nằm trên `<video>` nhưng dưới Control Bar để hiển thị text. Render `activeSub.text1` và `activeSub.text2` với CSS tách biệt (ví dụ: dòng trên to màu trắng, dòng dưới nhỏ màu vàng).

### Phase 2: Logic Đồng bộ Thời gian (Core Math)

Tạo một hàm helper bên trong `useEffect` khởi tạo player để tính toán thời gian thực của bộ phim, loại bỏ đi "độ phình" do quảng cáo.

- **Logic tính toán:**
  ```typescript
  const getRealMovieTime = (currentVideoTime: number) => {
    let adTimePassed = 0

    for (const region of adRegions) {
      if (currentVideoTime >= region.end) {
        adTimePassed += region.end - region.start
      } else if (currentVideoTime >= region.start && currentVideoTime < region.end) {
        return -1 // Tín hiệu báo đang trong vùng quảng cáo
      } else {
        break // Các quảng cáo sau chưa diễn ra
      }
    }
    return currentVideoTime - adTimePassed + manualOffset
  }
  ```

### Phase 3: Tích hợp vào Rendering Loop

Gắn logic tìm kiếm phụ đề vào hàm `pollAds` hiện có để tận dụng hiệu năng của `requestAnimationFrame` (60fps), giúp sub mượt mà không bị giật lag như dùng `timeupdate`.

- **Thực thi trong `pollAds`:**
  - Tính `realTime = getRealMovieTime(currentTime)`.
  - Nếu `realTime === -1`: Đang chiếu quảng cáo -> Tắt phụ đề (`setActiveSub(null)`).
  - Nếu bình thường: Dùng `.find()` (hoặc Binary Search để tối ưu) trên mảng `subtitles` để tìm câu sub có `start <= realTime <= end`. Cập nhật `activeSub`.

### Phase 4: Quản lý File và Client-side Storage

Triển khai một UI nhỏ bên ngoài (hoặc tích hợp vào nút bánh răng của Player) để User upload file.

- **Parsing:** Viết một utility function đơn giản dùng Regex để chuyển file `.srt` text thành mảng `SubtitleCue`.
- **Lưu trữ:** Sử dụng thư viện `idb-keyval` (wrapper rất nhẹ của IndexedDB) để lưu mảng này.
  - _Key:_ `subtitle_${progressKey}` (tận dụng luôn `progressKey` bạn đang dùng để lưu lịch sử xem).
  - _Value:_ Mảng JSON `subtitles`.

### Phase 5: Cải thiện Trải nghiệm Người dùng (UX/Hotkeys)

Thêm các phím tắt vào cục `handleKeyDown` để người dùng chủ động điều khiển phụ đề.

- **Sync Hotkeys:**
  - Phím `Z`: `setManualOffset(prev => prev - 0.5)` -> Báo hiệu: Sub đang hiện trễ, cần xuất hiện sớm hơn.
  - Phím `X`: `setManualOffset(prev => prev + 0.5)` -> Báo hiệu: Sub đang hiện sớm, cần xuất hiện trễ hơn.
- **Toggle Hotkey:** Phím `C` (hoặc `V`) để Bật/Tắt hiển thị sub nhanh (`setDisplaySub(!displaySub)`).

---

## 4. Rủi ro & Điểm cần lưu ý (Edge Cases)

| Tình huống                           | Cách xử lý                                                                                                                                                                              |
| :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User tua video lùi/tiến (Seek)**   | Hoàn toàn an toàn. Vì `getRealMovieTime` được tính lại từ đầu tại mỗi frame dựa trên `currentTime` hiện tại và mảng `adRegions`, nên dù user tua đi đâu sub vẫn khớp.                   |
| **Quảng cáo tải chậm/thay đổi**      | Bạn đang dùng mảng `adRegions` tính từ sự kiện `mediachange` của HLS. Hãy đảm bảo mảng này luôn được cập nhật lại chuẩn xác nếu server đổi playlist giữa chừng.                         |
| **Hiệu năng tìm kiếm mảng**          | Nếu file sub quá dài (> 2000 dòng), việc dùng `.find()` ở mỗi frame (60 lần/giây) có thể tốn CPU. Hãy dùng thuật toán **Binary Search** hoặc giữ lại `currentIndex` để tối ưu vòng lặp. |
| **Quản lý rác (Garbage Collection)** | Dù IndexedDB có dung lượng lớn, hãy cân nhắc viết logic xóa các phụ đề của những phim đã được lưu quá 30 ngày để tối ưu bộ nhớ trình duyệt cho user.                                    |
