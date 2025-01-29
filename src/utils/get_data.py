import os
import UnityPy
import argparse
import zipfile

UnityPy.set_assetbundle_decrypt_key(b"Big_True'sOrzmic")


def mkdir(dir: str):
    if not os.path.exists(dir):
        os.makedirs(dir)


def extract_data(apk_file):
    mkdir('.tmp')
    with zipfile.ZipFile(apk_file) as apk:
        entries = apk.namelist()
        for entry in entries:
            # MusicDatas
            if entry.startswith('assets/gamedatas'):
                with apk.open(entry) as f:
                    env = UnityPy.load(f)
                    for obj in env.objects:
                        data = obj.read()
                        if data.m_Name == 'MusicDatas':
                            with open('.tmp/MusicDatas.json', 'w') as f:
                                f.write(data.m_Script)
                                print('Saved MusicDatas.json')

            # Illustrators
            if entry.startswith('assets/charts'):
                with apk.open(entry) as f:
                    env = UnityPy.load(f)
                    for obj in env.objects:
                        if obj.type.name == 'Sprite':
                            data = obj.read()
                            dir = '.tmp/illustrators'
                            mkdir(dir)
                            path = os.path.join(dir, f'{data.m_Name}.png')
                            if not os.path.exists(path):
                                data.image.save(path)
                                print(f'Saved {path}')

            # Characters
            if entry.startswith('assets/characterheads'):
                with apk.open(entry) as f:
                    env = UnityPy.load(f)
                    for obj in env.objects:
                        if obj.type.name == 'Sprite':
                            data = obj.read()
                            dir = '.tmp/characters'
                            mkdir(dir)
                            path = os.path.join(
                                dir, f'{data.m_Name}.png')
                            if not os.path.exists(path):
                                data.image.save(path)
                                print(f'Saved {path}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("apk", nargs=1, metavar="file.apk", type=str,
                        help="Directory of the apk")
    args = parser.parse_args()
    extract_data(args.apk[0])


if __name__ == "__main__":
    main()
