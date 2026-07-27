import struct

def get_image_size(fname):
    with open(fname, 'rb') as f:
        head = f.read(24)
        if len(head) != 24:
            return
        if head.startswith(b'\x89PNG\r\n\x1a\n'):
            width, height = struct.unpack('>ii', head[16:24])
            print(f"Width: {width}, Height: {height}")

get_image_size(r"C:\Users\g3m43\Documents\Lightshot\Screenshot_62.png")
