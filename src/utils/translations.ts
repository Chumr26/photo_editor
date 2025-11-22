/**
 * Translation dictionary for the photo editor
 * Supports 'vi' (Vietnamese), 'en' (English), and 'both' (Bilingual) modes
 */

export type Language = 'vi' | 'en' | 'both';

export interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

export const translations: Translations = {
  // TopBar
  'topbar.replaceImage': { vi: 'Thay ảnh', en: 'Replace Image' },
  'topbar.replaceImage.tooltip': { vi: 'Thay ảnh (Upload new image)', en: 'Replace Image (Upload new image)' },
  'topbar.reset': { vi: 'Đặt lại', en: 'Reset' },
  'topbar.reset.tooltip': { vi: 'Đặt lại về trạng thái ban đầu (Reset to initial state)', en: 'Reset to initial state' },
  'topbar.grid': { vi: 'Lưới', en: 'Grid' },
  'topbar.grid.tooltip': { vi: 'Lưới (Grid) - G', en: 'Grid - G' },
  'topbar.rulers': { vi: 'Thước', en: 'Rulers' },
  'topbar.rulers.tooltip': { vi: 'Thước (Rulers) - R', en: 'Rulers - R' },
  'topbar.undo': { vi: 'Hoàn tác', en: 'Undo' },
  'topbar.undo.tooltip': { vi: 'Hoàn tác (Undo) - Ctrl/Cmd+Z', en: 'Undo - Ctrl/Cmd+Z' },
  'topbar.redo': { vi: 'Làm lại', en: 'Redo' },
  'topbar.redo.tooltip': { vi: 'Làm lại (Redo) - Ctrl/Cmd+Shift+Z', en: 'Redo - Ctrl/Cmd+Shift+Z' },
  'topbar.zoomOut': { vi: 'Thu nhỏ', en: 'Zoom Out' },
  'topbar.zoomOut.tooltip': { vi: 'Thu nhỏ (Zoom out) - Ctrl/Cmd+-', en: 'Zoom out - Ctrl/Cmd+-' },
  'topbar.zoomIn': { vi: 'Phóng to', en: 'Zoom In' },
  'topbar.zoomIn.tooltip': { vi: 'Phóng to (Zoom in) - Ctrl/Cmd++', en: 'Zoom in - Ctrl/Cmd++' },
  'topbar.fitScreen': { vi: 'Phù hợp màn hình', en: 'Fit to Screen' },
  'topbar.fitScreen.tooltip': { vi: 'Phù hợp màn hình (Fit to screen) - Ctrl/Cmd+0', en: 'Fit to screen - Ctrl/Cmd+0' },
  'topbar.download': { vi: 'Tải về', en: 'Download' },
  'topbar.download.tooltip': { vi: 'Tải ảnh về (Download/Export)', en: 'Download/Export' },
  'topbar.shortcuts': { vi: 'Phím tắt', en: 'Keyboard Shortcuts' },
  'topbar.shortcuts.tooltip': { vi: 'Phím tắt (Keyboard Shortcuts)', en: 'Keyboard Shortcuts' },
  'topbar.settings': { vi: 'Cài đặt', en: 'Settings' },
  'topbar.settings.tooltip': { vi: 'Cài đặt (Settings)', en: 'Settings' },

  // LeftToolbar - Tools
  'tool.move': { vi: 'Di chuyển', en: 'Move' },
  'tool.move.tooltip': { vi: 'Di chuyển (Move) - V', en: 'Move - V' },
  'tool.crop': { vi: 'Cắt', en: 'Crop' },
  'tool.crop.tooltip': { vi: 'Cắt (Crop) - C', en: 'Crop - C' },
  'tool.text': { vi: 'Chữ', en: 'Text' },
  'tool.text.tooltip': { vi: 'Chữ (Text) - T', en: 'Text - T' },
  'tool.insert': { vi: 'Chèn ảnh', en: 'Insert Image' },
  'tool.insert.tooltip': { vi: 'Chèn ảnh (Insert) - I', en: 'Insert Image - I' },
  'tool.brush': { vi: 'Cọ vẽ', en: 'Brush' },
  'tool.brush.tooltip': { vi: 'Cọ vẽ (Brush) - B', en: 'Brush - B' },

  // Settings Modal
  'settings.title': { vi: 'Cài đặt', en: 'Settings' },
  'settings.subtitle': { vi: 'Tùy chỉnh trình chỉnh sửa', en: 'Customize editor preferences' },
  'settings.language': { vi: 'Ngôn ngữ', en: 'Language' },
  'settings.language.vi': { vi: 'Tiếng Việt', en: 'Vietnamese' },
  'settings.language.vi.desc': { vi: 'Hiển thị giao diện bằng tiếng Việt', en: 'Show interface in Vietnamese' },
  'settings.language.en': { vi: 'English', en: 'English' },
  'settings.language.en.desc': { vi: 'Hiển thị giao diện bằng English', en: 'Show interface in English' },
  'settings.language.both': { vi: 'Song ngữ', en: 'Bilingual' },
  'settings.language.both.desc': { vi: 'Hiển thị cả tiếng Việt và English', en: 'Show both Vietnamese and English' },
  'settings.autoSave': { vi: 'Tự động lưu', en: 'Auto-Save' },
  'settings.autoSave.enable': { vi: 'Bật tự động lưu', en: 'Enable auto-save' },
  'settings.autoSave.interval': { vi: 'Khoảng thời gian lưu', en: 'Save interval' },
  'settings.autoSave.min1': { vi: '1 phút', en: '1 minute' },
  'settings.autoSave.min10': { vi: '10 phút', en: '10 minutes' },
  'settings.export': { vi: 'Xuất ảnh', en: 'Export' },
  'settings.export.format': { vi: 'Định dạng mặc định', en: 'Default format' },
  'settings.export.format.png': { vi: 'PNG (Lossless, trong suốt)', en: 'PNG (Lossless, transparent)' },
  'settings.export.format.jpg': { vi: 'JPG (Nhỏ gọn, không trong suốt)', en: 'JPG (Compact, no transparency)' },
  'settings.export.format.webp': { vi: 'WebP (Hiện đại, cân bằng)', en: 'WebP (Modern, balanced)' },
  'settings.export.quality': { vi: 'Chất lượng xuất', en: 'Export quality' },
  'settings.export.quality.low': { vi: 'Nhỏ', en: 'Small' },
  'settings.export.quality.high': { vi: 'Tốt nhất', en: 'Best' },
  'settings.canvas': { vi: 'Canvas', en: 'Canvas' },
  'settings.canvas.background': { vi: 'Nền canvas', en: 'Canvas background' },
  'settings.canvas.background.dark': { vi: 'Tối', en: 'Dark' },
  'settings.canvas.background.light': { vi: 'Sáng', en: 'Light' },
  'settings.canvas.background.checkered': { vi: 'Ô vuông', en: 'Checkered' },
  'settings.canvas.gridSize': { vi: 'Kích thước lưới', en: 'Grid size' },
  'settings.history': { vi: 'Lịch sử', en: 'History' },
  'settings.history.maxStates': { vi: 'Số bước lưu tối đa', en: 'Max history states' },
  'settings.history.memory.low': { vi: 'Ít bộ nhớ', en: 'Low memory' },
  'settings.history.memory.high': { vi: 'Nhiều bộ nhớ', en: 'High memory' },
  'settings.history.tip': { vi: '💡 Số bước càng nhiều, bộ nhớ sử dụng càng lớn', en: '💡 More states require more memory' },
  'settings.reset': { vi: '🔄 Đặt lại mặc định', en: '🔄 Reset to Defaults' },
  'settings.cancel': { vi: '❌ Hủy', en: '❌ Cancel' },
  'settings.save': { vi: '✅ Lưu', en: '✅ Save' },
  'settings.saved': { vi: 'Đã lưu cài đặt', en: 'Settings saved successfully' },
  'settings.reset.success': { vi: 'Đã đặt lại cài đặt mặc định', en: 'Settings reset to defaults' },

  // Right Panel Sections
  'panel.properties': { vi: 'Thuộc tính', en: 'Properties' },
  'panel.tools': { vi: 'Công cụ', en: 'Tools' },
  'panel.layers': { vi: 'Lớp', en: 'Layers' },
  'panel.history': { vi: 'Lịch sử', en: 'History' },
  'panel.presets': { vi: 'Bộ lọc sẵn', en: 'Presets' },
  'panel.export': { vi: 'Xuất ảnh', en: 'Export' },

  // Properties Section
  'properties.filename': { vi: 'Tên tệp', en: 'Filename' },
  'properties.dimensions': { vi: 'Kích thước', en: 'Dimensions' },
  'properties.filesize': { vi: 'Dung lượng', en: 'File Size' },
  'properties.aspectRatio': { vi: 'Tỷ lệ', en: 'Aspect Ratio' },
  'properties.resizeTitle': { vi: 'Thay đổi kích thước', en: 'Resize' },
  'properties.width': { vi: 'Chiều rộng', en: 'Width' },
  'properties.height': { vi: 'Chiều cao', en: 'Height' },
  'properties.keepAspectRatio': { vi: 'Giữ tỷ lệ', en: 'Keep aspect ratio' },
  'properties.presets': { vi: 'Kích thước mẫu', en: 'Presets' },
  'properties.custom': { vi: 'Tùy chỉnh', en: 'Custom' },
  'properties.changeInfo': { vi: 'Thay đổi', en: 'Change' },
  'properties.applyResize': { vi: 'Áp dụng', en: 'Apply Resize' },
  'properties.reset': { vi: 'Đặt lại', en: 'Reset' },
  'properties.resize': { vi: 'Thay đổi kích thước', en: 'Resize' },
  'properties.resize.button': { vi: 'Đổi kích thước', en: 'Resize' },
  'properties.transform': { vi: 'Biến đổi', en: 'Transform' },
  'properties.rotate90': { vi: 'Xoay 90°', en: 'Rotate 90°' },
  'properties.rotate180': { vi: 'Xoay 180°', en: 'Rotate 180°' },
  'properties.rotate270': { vi: 'Xoay 270°', en: 'Rotate 270°' },
  'properties.flipH': { vi: 'Lật ngang', en: 'Flip Horizontal' },
  'properties.flipV': { vi: 'Lật dọc', en: 'Flip Vertical' },
  'properties.freeRotate': { vi: 'Xoay tự do', en: 'Free Rotate' },
  'properties.type.image': { vi: 'Ảnh', en: 'Image' },
  'properties.type.adjustment': { vi: 'Điều chỉnh', en: 'Adjustment' },

  // Tools Section - Tabs
  'tools.tab.adjustments': { vi: 'Điều chỉnh cơ bản', en: 'Adjustments' },
  'tools.tab.color': { vi: 'Màu sắc', en: 'Color' },
  'tools.tab.crop': { vi: 'Cắt', en: 'Crop' },
  'tools.tab.transform': { vi: 'Xoay & Lật', en: 'Rotate & Flip' },
  'tools.tab.text': { vi: 'Thêm chữ', en: 'Text' },
  'tools.tab.insert': { vi: 'Chèn ảnh', en: 'Insert Image' },
  'tools.tab.brush': { vi: 'Vẽ & Cọ', en: 'Brush & Draw' },
  'tools.tab.advanced': { vi: 'Nâng cao', en: 'Advanced' },
  
  'tools.adjustments': { vi: 'Chỉnh sửa', en: 'Adjustments' },
  'tools.colorBalance': { vi: 'Cân bằng màu', en: 'Color Balance' },
  'tools.curves': { vi: 'Đường cong', en: 'Curves' },
  'tools.levels': { vi: 'Mức độ', en: 'Levels' },
  'tools.crop': { vi: 'Cắt ảnh', en: 'Crop' },
  'tools.text': { vi: 'Chữ', en: 'Text' },
  'tools.brush': { vi: 'Cọ vẽ', en: 'Brush' },
  'tools.insert': { vi: 'Chèn ảnh', en: 'Insert Image' },

  // Adjustments
  'adj.brightness': { vi: 'Độ sáng', en: 'Brightness' },
  'adj.contrast': { vi: 'Độ tương phản', en: 'Contrast' },
  'adj.saturation': { vi: 'Độ bão hòa', en: 'Saturation' },
  'adj.hue': { vi: 'Sắc độ', en: 'Hue' },
  'adj.blur': { vi: 'Làm mờ', en: 'Blur' },
  'adj.sharpen': { vi: 'Làm sắc nét', en: 'Sharpen' },
  'adj.grayscale': { vi: 'Đen trắng', en: 'Grayscale' },
  'adj.sepia': { vi: 'Nâu cổ điển', en: 'Sepia' },
  'adj.reset': { vi: 'Đặt lại', en: 'Reset All' },

  // Color Balance
  'colorBalance.toneRange': { vi: 'Vùng màu', en: 'Tone Range' },
  'colorBalance.shadows': { vi: 'Bóng tối', en: 'Shadows' },
  'colorBalance.midtones': { vi: 'Tông giữa', en: 'Midtones' },
  'colorBalance.highlights': { vi: 'Vùng sáng', en: 'Highlights' },
  'colorBalance.cyanRed': { vi: 'Lục lam - Đỏ', en: 'Cyan - Red' },
  'colorBalance.magentaGreen': { vi: 'Đỏ tía - Xanh lục', en: 'Magenta - Green' },
  'colorBalance.yellowBlue': { vi: 'Vàng - Xanh dương', en: 'Yellow - Blue' },
  'colorBalance.preserveLuminosity': { vi: 'Giữ độ sáng', en: 'Preserve Luminosity' },
  'colorBalance.currentValues': { vi: 'Giá trị hiện tại', en: 'Current values' },
  'colorBalance.reset': { vi: 'Đặt lại', en: 'Reset' },
  'colorBalance.tip1': { vi: 'Điều chỉnh màu sắc theo vùng tối, trung bình, sáng', en: 'Adjust colors in shadows, midtones, highlights' },
  'colorBalance.tip2': { vi: 'Di chuyển thanh về 0 để loại bỏ hiệu ứng', en: 'Move slider to 0 to remove effect' },

  // Crop
  'crop.description': { vi: 'Công cụ cắt ảnh. Chọn vùng trên canvas để cắt.', en: 'Crop tool. Select area on canvas to crop.' },
  'crop.start': { vi: 'Bắt đầu cắt', en: 'Start Crop' },
  'crop.redraw': { vi: 'Vẽ lại', en: 'Redraw' },
  'crop.aspectRatio': { vi: 'Tỷ lệ khung hình', en: 'Aspect Ratio' },
  'crop.free': { vi: 'Tự do', en: 'Free' },
  'crop.square': { vi: 'Vuông', en: 'Square' },
  'crop.landscape': { vi: 'Ngang', en: 'Landscape' },
  'crop.portrait': { vi: 'Dọc', en: 'Portrait' },
  'crop.locked': { vi: 'Tỷ lệ khóa', en: 'Locked ratio' },
  'crop.apply': { vi: 'Áp dụng cắt', en: 'Apply Crop' },
  'crop.cancel': { vi: 'Hủy', en: 'Cancel' },
  'crop.tip1': { vi: 'Kéo trên canvas để chọn vùng cắt', en: 'Drag on canvas to select crop area' },
  'crop.tip2': { vi: 'Chọn tỷ lệ để khóa kích thước', en: 'Choose ratio to lock size' },

  // Transform
  'transform.rotate': { vi: 'Xoay ảnh', en: 'Rotate' },
  'transform.rotate180': { vi: '180° Xoay ngược', en: 'Rotate 180°' },
  'transform.flip': { vi: 'Lật ảnh', en: 'Flip' },
  'transform.flipH': { vi: 'Lật ngang', en: 'Horizontal' },
  'transform.flipV': { vi: 'Lật dọc', en: 'Vertical' },
  'transform.freeRotate': { vi: 'Xoay tự do', en: 'Free Rotation' },
  'transform.angle': { vi: 'Góc xoay', en: 'Angle' },
  'transform.enterAngle': { vi: 'Nhập góc', en: 'Enter angle' },
  'transform.apply': { vi: 'Áp dụng xoay', en: 'Apply Rotation' },
  'transform.reset': { vi: 'Đặt lại', en: 'Reset' },
  'transform.tip1': { vi: 'Sử dụng thanh trượt hoặc nhập góc', en: 'Use slider or enter angle' },
  'transform.tip2': { vi: 'Góc dương: xoay thuận chiều kim đồng hồ', en: 'Positive: clockwise, Negative: counter-clockwise' },

  // Text
  'text.add': { vi: 'Thêm chữ', en: 'Add Text' },
  'text.addNew': { vi: 'Thêm chữ mới', en: 'Add New Text' },
  'text.list': { vi: 'Danh sách chữ', en: 'Text List' },
  'text.noText': { vi: 'Chưa có chữ nào', en: 'No text added' },
  'text.edit': { vi: 'Sửa', en: 'Edit' },
  'text.defaultText': { vi: 'Nhấp đúp để chỉnh sửa', en: 'Double-click to edit' },
  'text.font': { vi: 'Font chữ', en: 'Font Family' },
  'text.size': { vi: 'Kích thước', en: 'Font Size' },
  'text.color': { vi: 'Màu chữ', en: 'Text Color' },
  'text.weight': { vi: 'Độ đậm', en: 'Font Weight' },
  'text.weight.normal': { vi: 'Bình thường', en: 'Normal' },
  'text.weight.bold': { vi: 'Đậm', en: 'Bold' },
  'text.style': { vi: 'Kiểu chữ', en: 'Font Style' },
  'text.style.normal': { vi: 'Bình thường', en: 'Normal' },
  'text.style.italic': { vi: 'Nghiêng', en: 'Italic' },
  'text.align': { vi: 'Căn chỉnh', en: 'Text Align' },
  'text.align.left': { vi: 'Trái', en: 'Left' },
  'text.align.center': { vi: 'Giữa', en: 'Center' },
  'text.align.right': { vi: 'Phải', en: 'Right' },
  'text.delete': { vi: 'Xóa', en: 'Delete' },
  'text.duplicate': { vi: 'Nhân đôi', en: 'Duplicate' },

  // Insert
  'insert.upload': { vi: 'Tải ảnh lên', en: 'Upload Image' },
  'insert.list': { vi: 'Danh sách ảnh', en: 'Image Layers' },
  'insert.noImages': { vi: 'Chưa có ảnh nào', en: 'No images added' },
  'insert.tip1': { vi: 'Ảnh được thêm dưới dạng Layer', en: 'Images are added as Layers' },
  'insert.tip2': { vi: 'Dùng công cụ Di chuyển (V) để chỉnh vị trí', en: 'Use Move tool (V) to adjust position' },

  // Brush
  'brush.size': { vi: 'Kích thước cọ', en: 'Brush Size' },
  'brush.opacity': { vi: 'Độ mờ', en: 'Opacity' },
  'brush.hardness': { vi: 'Độ cứng', en: 'Hardness' },
  'brush.color': { vi: 'Màu cọ', en: 'Brush Color' },

  // Advanced
  'advanced.hsl': { vi: 'HSL / Chọn màu', en: 'HSL / Selective Color' },
  'advanced.clone': { vi: 'Sao chép/Làm lành', en: 'Clone/Heal' },
  'advanced.liquify': { vi: 'Làm biến dạng', en: 'Liquify' },
  'advanced.perspective': { vi: 'Hiệu chỉnh phối cảnh', en: 'Perspective' },
  'advanced.noise': { vi: 'Giảm nhiễu', en: 'Noise Reduction' },

  // Layers
  'layers.add': { vi: 'Thêm lớp', en: 'Add Layer' },
  'layers.delete': { vi: 'Xóa lớp', en: 'Delete Layer' },
  'layers.duplicate': { vi: 'Nhân đôi lớp', en: 'Duplicate Layer' },
  'layers.merge': { vi: 'Gộp lớp', en: 'Merge Layers' },
  'layers.opacity': { vi: 'Độ mờ', en: 'Opacity' },
  'layers.visible': { vi: 'Hiển thị', en: 'Visible' },
  'layers.locked': { vi: 'Khóa', en: 'Locked' },
  'layers.blendMode': { vi: 'Chế độ hòa trộn', en: 'Blend Mode' },
  'layers.layer': { vi: 'Lớp', en: 'Layer' },
  'layers.noLayers': { vi: 'Chưa có lớp nào. Thêm lớp để bắt đầu.', en: 'No layers yet. Add a layer to get started.' },
  'layers.dragTip': { vi: 'Kéo để sắp xếp', en: 'Drag to reorder' },
  'layers.visibility': { vi: 'Hiển thị/Ẩn', en: 'Show/Hide' },
  'layers.lock': { vi: 'Khóa/Mở khóa', en: 'Lock/Unlock' },
  'layers.deleteConfirm': { vi: 'Bạn có chắc chắn muốn xóa lớp này?', en: 'Are you sure you want to delete this layer?' },
  'layers.operations': { vi: 'Thao tác lớp', en: 'Layer Operations' },
  'layers.group': { vi: 'Nhóm lại', en: 'Group' },
  'layers.createMask': { vi: 'Tạo mặt nạ', en: 'Create Mask' },
  'layers.rasterize': { vi: 'Raster hóa', en: 'Rasterize' },

  // History
  'history.snapshots': { vi: 'Ảnh chụp nhanh', en: 'Snapshots' },
  'history.noHistory': { vi: 'Chưa có lịch sử chỉnh sửa', en: 'No edit history yet' },
  'history.goTo': { vi: 'Đi tới', en: 'Go to' },
  'history.saveSnapshot': { vi: 'Lưu bản nhánh', en: 'Save Snapshot' },
  'history.startEditing': { vi: 'Bắt đầu chỉnh sửa để lưu lịch sử', en: 'Start editing to save history' },
  'history.totalSnapshots': { vi: 'Tổng số bản', en: 'Total snapshots' },
  'history.currentPosition': { vi: 'Vị trí hiện tại', en: 'Current position' },
  'history.tip': { vi: 'Nhấn nút "Lưu bản nhánh" để tạo điểm lưu quan trọng', en: 'Click "Save Snapshot" to create important save points' },
  'history.justNow': { vi: 'Vừa xong', en: 'Just now' },
  'history.minutesAgo': { vi: '{n} phút trước', en: '{n} minutes ago' },
  'history.hoursAgo': { vi: '{n} giờ trước', en: '{n} hours ago' },

  // Presets
  'preset.none': { vi: 'Không có', en: 'None' },
  'preset.vintage': { vi: 'Vintage ấm', en: 'Warm Vintage' },
  'preset.vivid': { vi: 'Sống động', en: 'Vivid' },
  'preset.cool': { vi: 'Lạnh', en: 'Cool' },
  'preset.warm': { vi: 'Ấm', en: 'Warm' },
  'preset.blackAndWhite': { vi: 'Đen trắng', en: 'Black & White' },
  'preset.sepia': { vi: 'Nâu cổ điển', en: 'Sepia' },
  'preset.dramatic': { vi: 'Kịch tính', en: 'Dramatic' },
  'preset.soft': { vi: 'Mềm mại', en: 'Soft' },
  'preset.bwFilm': { vi: 'Phim đen trắng', en: 'Film B&W' },
  'preset.portrait': { vi: 'Chân dung mềm', en: 'Portrait Soft' },
  'preset.cinematic': { vi: 'Điện ảnh', en: 'Cinematic' },
  'preset.highContrast': { vi: 'Tương phản cao', en: 'High Contrast' },
  'preset.softGlow': { vi: 'Ánh sáng mềm', en: 'Soft Glow' },
  'preset.description': { vi: 'Áp dụng bộ lọc có sẵn', en: 'Apply preset filters' },
  'preset.resetAll': { vi: 'Xóa tất cả bộ lọc', en: 'Reset All Filters' },
  'preset.saveCustom': { vi: 'Lưu bộ lọc tùy chỉnh', en: 'Save Custom Preset' },
  'preset.presetName': { vi: 'Tên bộ lọc...', en: 'Preset name...' },
  'preset.tip': { vi: 'Điều chỉnh các thông số sau khi áp dụng bộ lọc', en: 'Adjust parameters after applying preset' },

  // Export
  'export.title': { vi: 'Xuất ảnh', en: 'Export Image' },
  'export.format': { vi: 'Định dạng', en: 'Format' },
  'export.quality': { vi: 'Chất lượng', en: 'Quality' },
  'export.scale': { vi: 'Tỷ lệ xuất', en: 'Export Scale' },
  'export.transparent': { vi: 'Nền trong suốt', en: 'Transparent Background' },
  'export.download': { vi: 'Tải ảnh về', en: 'Download' },
  'export.filename': { vi: 'Tên tệp', en: 'Filename' },
  'export.estimatedSize': { vi: 'Dung lượng ước tính', en: 'Estimated size' },
  'export.outputSize': { vi: 'Kích thước xuất', en: 'Output size' },
  'export.dpi': { vi: 'DPI (cho in ấn)', en: 'DPI (for printing)' },
  'export.dpi72': { vi: '72 DPI (Web)', en: '72 DPI (Web)' },
  'export.dpi150': { vi: '150 DPI (Tài liệu)', en: '150 DPI (Document)' },
  'export.dpi300': { vi: '300 DPI (In chất lượng cao)', en: '300 DPI (High Quality Print)' },
  'export.dpi600': { vi: '600 DPI (In chuyên nghiệp)', en: '600 DPI (Professional Print)' },
  'export.layersSeparately': { vi: 'Xuất từng lớp riêng', en: 'Export layers separately' },
  'export.presets': { vi: 'Bộ cài đặt xuất', en: 'Export Presets' },
  'export.preset.web': { vi: 'Web tối ưu', en: 'Web Optimized' },
  'export.preset.instagram': { vi: 'Instagram (1080×1080, JPG 85%)', en: 'Instagram (1080×1080, JPG 85%)' },
  'export.preset.facebook': { vi: 'Facebook (1200×630, JPG 85%)', en: 'Facebook (1200×630, JPG 85%)' },
  'export.preset.print': { vi: 'In ấn (Print, 300 DPI, PNG)', en: 'Print (300 DPI, PNG)' },
  'export.preset.logo': { vi: 'Logo (PNG trong suốt)', en: 'Logo (Transparent PNG)' },
  'export.exporting': { vi: 'Đang xuất...', en: 'Exporting...' },
  'export.info.jpg': { vi: 'JPG: Nhỏ gọn, phù hợp cho web và ảnh', en: 'JPG: Compact, suitable for web and photos' },
  'export.info.png': { vi: 'PNG: Hỗ trợ trong suốt, chất lượng cao', en: 'PNG: Transparency support, high quality' },
  'export.info.webp': { vi: 'WebP: Nhỏ hơn JPG, hỗ trợ trong suốt', en: 'WebP: Smaller than JPG, transparency support' },
  'export.info.svg': { vi: 'SVG: Vector, kích thước linh hoạt', en: 'SVG: Vector, scalable size' },

  // Upload Zone
  'upload.title': { vi: 'Tải ảnh lên', en: 'Upload Image' },
  'upload.dragDrop': { vi: 'Kéo thả ảnh vào đây', en: 'Drag and drop image here' },
  'upload.or': { vi: 'hoặc nhấn nút bên dưới để chọn ảnh', en: 'or click the button below to select image' },
  'upload.browse': { vi: 'Chọn ảnh', en: 'Select Image' },
  'upload.supported': { vi: 'Hỗ trợ', en: 'Supported' },
  'upload.maxSize': { vi: 'Kích thước tối đa', en: 'Maximum size' },

  // Toast Messages
  'toast.crop.success': { vi: 'Đã cắt ảnh thành công', en: 'Image cropped successfully' },
  'toast.crop.tooSmall': { vi: 'Vùng cắt quá nhỏ', en: 'Crop area too small' },
  'toast.resize.success': { vi: 'Đã thay đổi kích thước ảnh thành công', en: 'Image resized successfully' },
  'toast.resize.tooSmall': { vi: 'Kích thước mới quá nhỏ', en: 'New size too small' },
  'toast.invalidDimensions': { vi: 'Kích thước không hợp lệ', en: 'Invalid dimensions' },
  'toast.noSizeChange': { vi: 'Kích thước không thay đổi', en: 'No size change' },
  'toast.rotate.success': { vi: 'Đã xoay ảnh thành công', en: 'Image rotated successfully' },
  'toast.flip.horizontal': { vi: 'Đã lật ảnh ngang thành công', en: 'Image flipped horizontally' },
  'toast.flip.vertical': { vi: 'Đã lật ảnh dọc thành công', en: 'Image flipped vertically' },
  'toast.reset.success': { vi: 'Đã đặt lại ảnh về trạng thái ban đầu', en: 'Image reset to initial state' },
  'toast.insert.invalidFile': { vi: 'Vui lòng chọn tệp ảnh', en: 'Please select an image file' },
  'toast.insert.tooLarge': { vi: 'Ảnh quá lớn. Tối đa 20MB', en: 'Image too large. Max 20MB' },
  'toast.insert.success': { vi: 'Đã thêm ảnh vào layer', en: 'Image added to layer' },
  'toast.export.success': { vi: 'Đã xuất ảnh thành công', en: 'Image exported successfully' },
  'toast.export.error': { vi: 'Lỗi khi xuất ảnh', en: 'Error exporting image' },
  'toast.tool.crop': { vi: 'Vẽ khung cắt trên canvas', en: 'Draw crop area on canvas' },
  'toast.tool.text': { vi: 'Chế độ thêm chữ. Sử dụng bảng bên phải để thêm và quản lý chữ', en: 'Text mode. Use right panel to add and manage text' },
  'toast.tool.insert': { vi: 'Chế độ chèn ảnh. Sử dụng bảng bên phải để tải ảnh lên', en: 'Insert mode. Use right panel to upload image' },

  // Keyboard Shortcuts
  'shortcuts.title': { vi: 'Phím tắt', en: 'Keyboard Shortcuts' },
  'shortcuts.general': { vi: 'Chung', en: 'General' },
  'shortcuts.tools': { vi: 'Công cụ', en: 'Tools' },
  'shortcuts.view': { vi: 'Hiển thị', en: 'View' },
  'shortcuts.editing': { vi: 'Chỉnh sửa', en: 'Editing' },
  'shortcuts.undo': { vi: 'Hoàn tác', en: 'Undo' },
  'shortcuts.redo': { vi: 'Làm lại', en: 'Redo' },
  'shortcuts.zoomIn': { vi: 'Phóng to', en: 'Zoom In' },
  'shortcuts.zoomOut': { vi: 'Thu nhỏ', en: 'Zoom Out' },
  'shortcuts.zoomWheel': { vi: 'Phóng to/Thu nhỏ', en: 'Zoom In/Out' },
  'shortcuts.fitScreen': { vi: 'Vừa màn hình', en: 'Fit to Screen' },
  'shortcuts.actualSize': { vi: 'Kích thước thực', en: 'Actual Size' },
  'shortcuts.pan': { vi: 'Di chuyển canvas', en: 'Pan' },
  'shortcuts.moveTool': { vi: 'Công cụ di chuyển', en: 'Move Tool' },
  'shortcuts.cropTool': { vi: 'Công cụ cắt', en: 'Crop Tool' },
  'shortcuts.textTool': { vi: 'Công cụ chữ', en: 'Text Tool' },
  'shortcuts.insertImage': { vi: 'Chèn ảnh', en: 'Insert Image' },
  'shortcuts.brushTool': { vi: 'Cọ vẽ', en: 'Brush Tool' },
  'shortcuts.toggleLayers': { vi: 'Bật/tắt Lớp', en: 'Toggle Layers' },
  'shortcuts.toggleHistory': { vi: 'Bật/tắt Lịch sử', en: 'Toggle History' },
  'shortcuts.toggleGrid': { vi: 'Bật/tắt Lưới', en: 'Toggle Grid' },
  'shortcuts.toggleRulers': { vi: 'Bật/tắt Thước', en: 'Toggle Rulers' },
  'shortcuts.togglePresets': { vi: 'Bật/tắt Bộ lọc', en: 'Toggle Presets' },
  'shortcuts.tip': { vi: 'Sử dụng phím tắt để chỉnh sửa nhanh hơn. Bạn có thể tùy chỉnh phím tắt trong Cài đặt.', en: 'Use keyboard shortcuts for faster editing. You can customize shortcuts in Settings.' },

  // Common
  'common.close': { vi: 'Đóng', en: 'Close' },
  'common.apply': { vi: 'Áp dụng', en: 'Apply' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.delete': { vi: 'Xóa', en: 'Delete' },
  'common.duplicate': { vi: 'Nhân đôi', en: 'Duplicate' },
  'common.reset': { vi: 'Đặt lại', en: 'Reset' },
  'common.ok': { vi: 'OK', en: 'OK' },
  'common.yes': { vi: 'Có', en: 'Yes' },
  'common.no': { vi: 'Không', en: 'No' },
};

/**
 * Get translation for a key based on language preference
 */
export function getTranslation(key: string, language: Language): string {
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }

  switch (language) {
    case 'vi':
      return translation.vi;
    case 'en':
      return translation.en;
    case 'both':
      return `${translation.vi} / ${translation.en}`;
    default:
      return translation.vi; // Fallback to Vietnamese
  }
}

/**
 * Helper to get only Vietnamese translation
 */
export function getVietnamese(key: string): string {
  return translations[key]?.vi || key;
}

/**
 * Helper to get only English translation
 */
export function getEnglish(key: string): string {
  return translations[key]?.en || key;
}
