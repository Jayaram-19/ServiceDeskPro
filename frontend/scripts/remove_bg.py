from PIL import Image

def remove_background(input_path, output_path, tolerance=30):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is near white
        # White is (255, 255, 255)
        if (item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance):
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Crop the image to its bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

remove_background("d:\\ServiceDeskPro\\frontend\\public\\logo.jpg", "d:\\ServiceDeskPro\\frontend\\public\\logo.png")
