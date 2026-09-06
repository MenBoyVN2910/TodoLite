from PIL import Image, ImageDraw
import os

os.makedirs('src-tauri/icons', exist_ok=True)

def create_notebook_icon(size):
    # RGBA image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = max(2, int(size * 0.08))
    book_w = size - 2 * pad
    book_h = size - 2 * pad
    radius = max(3, int(size * 0.12))

    # Notebook Cover: Warm amber / leather terracotta
    cover_color = (217, 119, 6, 255) # Amber #d97706
    spine_color = (194, 65, 12, 255) # Dark terracotta #c2410c
    paper_color = (252, 250, 247, 255)
    line_color  = (220, 38, 38, 200) # Red accent bookmark / margin

    # Draw rounded rectangle for cover
    draw.rounded_rectangle(
        [pad, pad, pad + book_w, pad + book_h],
        radius=radius,
        fill=cover_color
    )

    # Spine on left
    spine_w = max(3, int(book_w * 0.22))
    draw.rounded_rectangle(
        [pad, pad, pad + spine_w, pad + book_h],
        radius=radius,
        fill=spine_color
    )
    # Fix right border of spine
    draw.rectangle(
        [pad + spine_w // 2, pad, pad + spine_w, pad + book_h],
        fill=spine_color
    )

    # Inner Paper page showing on right
    page_pad = max(2, int(size * 0.06))
    page_left = pad + spine_w + 2
    page_right = pad + book_w - page_pad
    page_top = pad + page_pad
    page_bottom = pad + book_h - page_pad

    if page_right > page_left and page_bottom > page_top:
        draw.rounded_rectangle(
            [page_left, page_top, page_right, page_bottom],
            radius=max(2, radius - 2),
            fill=paper_color
        )

        # Ruled lines or check mark
        if size >= 32:
            check_color = (22, 101, 52, 255) # Green check
            # Draw checkmark inside page
            cx = (page_left + page_right) // 2
            cy = (page_top + page_bottom) // 2
            draw.line([(cx - 3, cy), (cx - 1, cy + 3), (cx + 4, cy - 3)], fill=check_color, width=max(1, size // 32))

    return img

sizes = [16, 32, 64, 128, 256]
images = [create_notebook_icon(s) for s in sizes]

# Save standard icons
create_notebook_icon(32).save('src-tauri/icons/32x32.png')
create_notebook_icon(128).save('src-tauri/icons/128x128.png')
create_notebook_icon(128).save('src-tauri/icons/icon.png')
create_notebook_icon(32).save('src-tauri/icons/tray.png')

# Save ICO
images[0].save('src-tauri/icons/icon.ico', format='ICO', sizes=[(16,16), (32,32), (64,64), (128,128), (256,256)])

print("Generated all icons successfully!")
