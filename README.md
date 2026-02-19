# DumanApp (Sigara Takip Uygulaması)

DumanApp, kullanıcının günlük sigara tüketimini takip etmesini sağlayan, takvim üzerinden geçmiş kayıtlarını görebildiği ve belirli aralıklarla hatırlatıcı bildirimler alabildiği bir mobil uygulamadır. Ayrıca admin paneli üzerinden kullanıcılara özel mesajlar gönderilebilir.

Bu proje **Expo (Development Build)** ve **React Native** kullanılarak geliştirilmiştir.

## Özellikler

- **Günlük Takip:** Kullanıcı, içtiği sigara sayısını anlık olarak kaydedebilir.
- **Takvim Görünümü:** Geçmiş günlere ait tüketim verilerini takvim üzerinde görüntüleme.
- **Bildirimler:** Kullanıcının belirlediği zamanlarda hatırlatıcı bildirimler (Scheduled Notifications).
- **Admin Mesajları:** Firebase üzerinden uzaktan yapılandırılabilen mesajlar.
- **Giriş Ekranı:** Kullanıcı adı ile basit giriş sistemi.

---

##  Gereksinimler

Projeyi yerel ortamınızda çalıştırmadan önce aşağıdaki araçların kurulu olduğundan emin olun:

- **Node.js** (LTS sürümü önerilir)
- **Git**
- **Java Development Kit (JDK 17)** (Android derlemeleri için zorunludur)
- **Android Studio** (Android SDK ve Emulator kurulumu için)
- **Expo CLI** (`npm install -g expo-cli`)

---

## Kurulum

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/kullaniciadi/dumanapp.git
   cd dumanapp
   ```

2. **Bağımlıları Yükleyin:**
   ```bash
   npm install
   ```
   Eğer hata alırsanız `--legacy-peer-deps` bayrağını deneyebilirsiniz:
   ```bash
   npm install --legacy-peer-deps
   ```

---

## Uygulamayı Çalıştırma

Bu proje **Development Build** kullanmaktadır. Klasik Expo Go uygulaması ile **çalışmayabilir**. Yerel bir build almanız gerekir.

### Android İçin Çalıştırma:

1. **Emülatörü Açın:** Android Studio üzerinden bir emülatör başlatın veya fiziksel cihazınızı USB hata ayıklama modu açık şekilde bağlayın.
2. **Projeyi Başlatın:**
   ```bash
   npm run android
   ```
   Bu komut, `android` klasöründeki native projeyi derleyip cihaza yükleyecektir. İlk derleme biraz zaman alabilir.

### Metro Bundler'ı Başlatma:
Eğer uygulama zaten yüklü ise sadece Metro sunucusunu başlatmak için:
```bash
npm start
```
(Gelen ekranda `a` tuşuna basarak Android'e bağlanabilirsiniz).

---

## Olası Hatalar ve Çözümleri

### 1. `google-services.json` Eksik Hatası
Firebase yapılandırması için `google-services.json` dosyasının `android/app/` dizininde veya proje kök dizininde olması gerekir. Eğer bu dosya yoksa uygulama derlenirken hata verir.
**Çözüm:** Firebase konsolundan `google-services.json` dosyasını indirip proje kök dizinine ve `android/app/` içine koyun.

### 2. `JAVA_HOME` Ayarlanmamış
Derleme sırasında Java hatası alıyorsanız JDK yolunuz tanımlı değildir.
**Çözüm:** Ortam değişkenlerine `JAVA_HOME` ekleyin. Genellikle: `C:\Program Files\Java\jdk-17...`

### 3. "SDK location not found"
Android SDK yolu bulunamıyor hatası.
**Çözüm:** `android/local.properties` dosyası oluşturun ve içine şunu yazın (Windows için):
```properties
sdk.dir=C\:\\Users\\KULLANICI_ADINIZ\\AppData\\Local\\Android\\Sdk
```
*(Ters eğik çizgilere dikkat edin)*

### 4. Bağımlılık Çakışmaları 
`npm install` sırasında hata alıyorsanız, eski `node_modules` klasörünü silip tekrar deneyin:
```bash
rm -rf node_modules
# veya Windows powershell: Remove-Item -Recurse -Force node_modules
npm install
```

### 5. Metro Bundler Kilitlenmesi
Eğer değişiklikler anlık yansımıyor veya tuhaf hatalar alıyorsanız önbelleği temizleyerek başlatın:
```bash
npm start -- --reset-cache
# veya
npx expo start -c
```

---

## 📱 Dosya Yapısı Özet

- `src/`: Uygulamanın kaynak kodları (Ekranlar, Bileşenler, Utils).
- `android/`: Native Android proje dosyaları.
- `app.json`: Expo yapılandırma dosyası.
- `App.tsx` / `index.tsx`: Giriş noktası.
