# dumanapp – Product Overview

## 🎯 Ürün Amacı

dumanapp, kullanıcıların:

- Günlük sigara tüketimini takip etmesini  
- Harcamalarını analiz etmesini  
- Azaltma hedefleri koymasını  
- Kriz anlarında destek almasını  
- Gamification ile motivasyon kazanmasını  

sağlayan cross-platform (iOS + Android) bir mobil uygulamadır.

---

# 🏗 1️⃣ Genel Sistem Mimarisi

## 📲 Client (Mobile App)

### Öneri:
- React Native  
- MVVM
- State management: Riverpod / Bloc / Redux  

### Client Katmanları
1. Presentation Layer (UI)  
2. Domain Layer (Business Logic)  
3. Data Layer (Repository + API + Local DB)  

---

## ☁ Backend (Admin + Bildirim + Veri Senkronizasyonu)

### Backend İçerikleri:
- Authentication  
- Kullanıcı verileri  
- Bildirim servisi  
- Admin panel (motivasyon mesajı gönderme)  
- Achievement hesaplama logic’i  


- Firebase (Auth + Firestore + FCM)  

---

## 🔔 Push Notification Yapısı

- FCM / APNs  
- Scheduled notification  
- Event-triggered notification  
- Admin broadcast notification  

---

# 🗂 2️⃣ Feature Breakdown (Modül Bazlı)

---

## 🔢 MODÜL 1: Sigara Takibi

### Özellikler:
- Günlük sigara sayacı  
- +1 butonu  
- Günlük / haftalık / aylık grafik  
- Son sigara zamanı kaydı  
- “Son sigaradan bu yana geçen süre” sayacı  

### Teknik Gereksinimler:
- Timestamp kayıt sistemi  
- Local + cloud sync  
- Grafik kütüphanesi  

---

## 💰 MODÜL 2: Finans Takibi

### Özellikler:
- Paket fiyatı girme  
- Günlük içim hesaplama  
- Aylık / yıllık maliyet hesaplama  
- Potansiyel tasarruf hesaplama  

### Business Logic:

---

## 🎯 MODÜL 3: Hedef & Limit Sistemi

### Özellikler:
- Günlük limit belirleme  
- “10’dan 7’ye düşür” planı  
- Limit aşımında bildirim  
- Limit başarı kaydı  

### Gereksinimler:
- Günlük reset mekanizması  
- Limit state kontrolü  
- Notification trigger  

---

## 🏆 MODÜL 4: Başarı Sistemi (Gamification)

### Achievement Türleri:
- 1 gün limit aşmadın  
- 7 gün üst üste hedef  
- 100 sigara azaltma  
- X TL tasarruf  

### Teknik:
- Rule engine  
- Badge sistemi  
- Progress tracking  

---

## 🔥 MODÜL 5: Kriz Modu

### Özellikler:
- “Sigara içmek istiyorum” butonu  
- 2 dk nefes egzersizi (animasyonlu)  
- 30 sn mini oyun  
- Motivasyon mesajı  

### Teknik:
- Countdown timer  
- Simple mini-game (tap challenge)  
- Random message fetch  

---

## 🔔 MODÜL 6: Bildirim Sistemi

### Bildirim Türleri:

#### Otomatik:
- Limit aşıldı  
- 2 saat geçti  
- Günlük hatırlatma  

#### Admin Broadcast:
- Motivasyon mesajı  
- Kampanya mesajı  

### Gereksinim:
- Admin panel  
- Push service  
- Targeted notification support  

---

# 🧱 3️⃣ Veri Modeli (Basitleştirilmiş)

## User
- id  
- email  
- dailyLimit  
- packPrice  
- createdAt  

## CigaretteLog
- id  
- userId  
- timestamp  

## Achievement
- id  
- userId  
- type  
- unlockedAt  

## NotificationLog
- id  
- userId  
- type  
- sentAt  