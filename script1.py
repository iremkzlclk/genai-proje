import random
import time
import os


def ekranı_temizle():
    # Windows için 'cls', Mac/Linux için 'clear'
    os.system('cls' if os.name == 'nt' else 'clear')


def hareketli_agac(boyut):
    YEŞİL = '\033[92m'
    SARI = '\033[93m'
    SIFIRLA = '\033[0m'
    KAHVE = '\033[33m'

    renkler = ['\033[91m', '\033[94m', '\033[95m', '\033[96m', '\033[33m']
    susler = ['O', '@', '*', '+']

    try:
        while True:
            ekranı_temizle()
            # Yıldız
            print(" " * boyut + SARI + "★" + SIFIRLA)

            # Gövde ve yanıp sönen ışıklar
            for i in range(1, boyut + 1):
                bosluk = " " * (boyut - i)
                dallar = ""
                for _ in range(2 * i - 1):
                    if random.random() < 0.25:  # %25 ihtimalle ışık/süs
                        dallar += random.choice(renkler) + random.choice(susler) + SIFIRLA
                    else:
                        dallar += YEŞİL + "*" + SIFIRLA
                print(bosluk + dallar)

            # Kütük
            for _ in range(2):
                print(" " * (boyut - 1) + KAHVE + "|||" + SIFIRLA)

            print("\n" + " " * (boyut - 10) + "MUTLU YILLAR MÜMKÜNSE TABİİİ")
            print("\n(Durdurmak için Ctrl+C tuşlarına bas!)")

            time.sleep(0.5)  # Yarım saniyede bir yeniler
    except KeyboardInterrupt:
        print("\nProgram durduruldu.")


# Çalıştır
hareketli_agac(15)