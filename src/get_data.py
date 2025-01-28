import os
import UnityPy
import argparse
import zipfile

UnityPy.set_assetbundle_decrypt_key(b"Big_True'sOrzmic")


def mkdir(dir: str):
    if not os.path.exists(dir):
        os.makedirs(dir)


def get_illustrator(apk_file, chart):
    with zipfile.ZipFile(apk_file) as apk:
        with apk.open(f"assets/charts/{chart}") as f:
            env = UnityPy.load(f)
            for obj in env.objects:
                data = obj.read()
                if obj.type.name == "Sprite":
                    dir = "tmp"
                    mkdir(dir)
                    path = os.path.join(dir, f"{data.m_Name}.png")
                    data.image.save(path)


def get_character(apk_file, char: tuple):
    char_id, char_skin = char
    with zipfile.ZipFile(apk_file) as apk:
        with apk.open("assets/characterheads") as f:
            env = UnityPy.load(f)
            for obj in env.objects:
                data = obj.read()
                if obj.type.name == "Sprite" and data.m_Name == f"{char_id}_{char_skin}":
                    dir = "tmp"
                    mkdir(dir)
                    path = os.path.join(dir, f"char_{char_id}_{char_skin}.png")
                    data.image.save(path)


def get_full_character(apk_file, char: tuple):
    char_id, char_skin = char
    with zipfile.ZipFile(apk_file) as apk:
        with apk.open(f"assets/character_{char_id}") as f:
            env = UnityPy.load(f)
            for obj in env.objects:
                data = obj.read()
                if obj.type.name == "Sprite" and data.m_Name == f"{char_skin}":
                    dir = "tmp"
                    mkdir(dir)
                    path = os.path.join(dir, f"charfull_{char_id}_{char_skin}.png")
                    data.image.save(path)


def get_music(apk_file):
    with zipfile.ZipFile(apk_file) as apk:
        with apk.open("assets/gamedatas") as f:
            env = UnityPy.load(f)
            for obj in env.objects:
                data = obj.read()
                if data.m_Name == "MusicDatas":
                    with open("miscs/MusicDatas.json", "w") as f:
                        f.write(data.m_Script)


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("apk", nargs=1, metavar="file.apk", type=str,
                        help="Directory of the apk")
    parser.add_argument("--chart", nargs=1, type=str,
                        metavar="chart_name", default=None,
                        help="Get the illustrator of a chart")
    parser.add_argument("--char", nargs=2, type=int,
                        metavar=('char_id', 'char_skin'), default=None,
                        help="Get the illustrator of the character")
    parser.add_argument("--music", action='store_true',
                        help="Get the music metadata")
    parser.add_argument("--full", action='store_true',
                        help="Get the full illustrator of a character instead")

    args = parser.parse_args()

    if args.chart is not None:
        get_illustrator(args.apk[0], args.chart[0])
    if args.char is not None:
        get_character(args.apk[0], args.char)
    if args.music is not None:
        get_music(args.apk[0])


if __name__ == "__main__":
    main()
