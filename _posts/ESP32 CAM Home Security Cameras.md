---
layout: post
title: ESP32 CAM Home Security Cameras
author: Will Kelly
date: 2025-07-28
tags: Electronics, Microcontrollers, ESP32
---

I wanted a home camera security system, that I made from scratch and with came with total control. For this, I searched for a cheap camera module and came upon the ESP32 CAM—a device with not much more computing power than an Arduino, so I was at first skeptical, but which has been shown by others to be able to stream video over HTTP. I bought a pack of four ESP32 CAM boards from [Amazon](https://www.amazon.com/dp/B09265G5Z4) for less than $30.

The ESP32 CAM is a board with an ESP32 processor on the back, and a micro SD card slot on the front along with a port for the detachable camera component to snap in. By itself the board cannot be flashed with a USB, but the one I bought, and most ones you can buy, come with a basic USB-to-TTL converter board connected to the CAM's pins, which is shown as the bottom board below. That converter board allows you to directly flash the CAM with whatever code you come up with, and my boards with with a USB 2.0 A-to-MicroB cable. Using the converter and cable as a power source instead of needing a breadboard is an added bonus.

![ESP32 CAM](https://i0.wp.com/randomnerdtutorials.com/wp-content/uploads/2021/01/ESP32-CAM-MB-Micro-USB-Programmer-CH340G-Serial-Chip.jpg?w=1280&quality=100&strip=all&ssl=1)

Like all ESP32s, this board is flashed from the Arduino IDE, you just have to select the port that your ESP CAM is plugged into, and specify the board as ESP32-CAM or AI THINKER ESP32-CAM, or something of the sort.

To start, I wanted to flash the onboard LED as a sanity test. I found [this script](https://lastminuteengineers.com/getting-started-with-esp32-cam/) to do that:

```C++
int flashPin = 4;

void setup() {
    pinMode(flashPin, OUTPUT);
}

void loop() {
    digitalWrite(flashPin, HIGH);
    delay(1000);
    digitalWrite(flashPin, LOW);
    delay(1000);
}
```

That was a simple script and worked easy enough; the onboard LED is extremely bright. Next, since I hadn't done much with ESP32s before and wanted to remind myself, a [script](https://deepbluembedded.com/esp32-connect-to-wifi-network-arduino/) to scan all available WiFi networks and print out some basic data about each.

```C++
#include "WiFi.h"

void setup()
{
    Serial.begin(115200);
    // Set WiFi to station mode and disconnect from an AP if it was previously connected.
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    delay(100);
    Serial.println("Setup done");
}

void loop()
{
    Serial.println("Scan start");
    
    // WiFi.scanNetworks will return the number of networks found.
    int n = WiFi.scanNetworks();
    Serial.println("Scan done");
    if (n == 0) {
        Serial.println("no networks found");
    } else {
        Serial.print(n);
        Serial.println(" networks found");
        Serial.println("Nr | SSID                             | RSSI | CH | Encryption");
        
        for (int i = 0; i < n; ++i) {
            // Print SSID and RSSI for each network found
            Serial.printf("%2d",i + 1);
            Serial.print(" | ");
            Serial.printf("%-32.32s", WiFi.SSID(i).c_str());
            Serial.print(" | ");
            Serial.printf("%4d", WiFi.RSSI(i));
            Serial.print(" | ");
            Serial.printf("%2d", WiFi.channel(i));
            Serial.print(" | ");
            
            switch (WiFi.encryptionType(i))
            {
            case WIFI_AUTH_OPEN:
                Serial.print("open");
                break;
            case WIFI_AUTH_WEP:
                Serial.print("WEP");
                break;
            case WIFI_AUTH_WPA_PSK:
                Serial.print("WPA");
                break;
            case WIFI_AUTH_WPA2_PSK:
                Serial.print("WPA2");
                break;
            case WIFI_AUTH_WPA_WPA2_PSK:
                Serial.print("WPA+WPA2");
                break;
            case WIFI_AUTH_WPA2_ENTERPRISE:
                Serial.print("WPA2-EAP");
                break;
            case WIFI_AUTH_WPA3_PSK:
                Serial.print("WPA3");
                break;
            case WIFI_AUTH_WPA2_WPA3_PSK:
                Serial.print("WPA2+WPA3");
                break;
            case WIFI_AUTH_WAPI_PSK:
                Serial.print("WAPI");
                break;
            default:
                Serial.print("unknown");
            }
            Serial.println();

            delay(10);
        }
    }

    Serial.println("");
    // Delete the scan result to free memory for code below.
    WiFi.scanDelete();
    // Wait a bit before scanning again.
    delay(5000);
}
```

This script showed me what I already knew, that my Wifi was active and accessible. So after that, [next](https://deepbluembedded.com/esp32-connect-to-wifi-network-arduino/) was to actually connect to the WiFi network.

```C
#include <WiFi.h>

// Replace with your own network credentials
const char* ssid = "yourNetworkSSID";
const char* password = "yourNetworkPassword";

void setup(){
    Serial.begin(115200);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.println("\nConnecting to WiFi Network ..");

    while(WiFi.status() != WL_CONNECTED){
        Serial.print(".");
        delay(100);
    }
    
    Serial.println("\nConnected to the WiFi network");
    Serial.print("Local ESP32 IP: ");
    Serial.println(WiFi.localIP());
}

void loop(){
    // Do Nothing
}
```

So my ESP32 CAM was connecting to my local network. Now I want to sanity test the camera capability. My design was to take a photo, and serve it via HTTP on whatever IP address the ESP32 CAM was allocated to on my local network, so that I would be able to go to my browser, type in the IP, and see a picture that the CAM took. So Step #1, create an arbitrary HTML page and serve it at an IP over HTTP:

```C++
// Basic ESP32-CAM HTTP Server

#include <WiFi.h>
#include <WebServer.h>

// Replace with your network credentials
const char* ssid     = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

WebServer server(80);

// HTML page: a blank page with a black square in the middle.
const char* htmlResponse = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESP32-CAM</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .placeholder { width: 320px; height: 240px; background-color: black; }
  </style>
</head>
<body>
  <div class="placeholder"></div>
</body>
</html>
)rawliteral";

// The client will access the root directory of the IP address
void handleRoot() {
  server.send(200, "text/html", htmlResponse);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());

  // Start the server
  server.on("/", handleRoot);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}

```

In that example, I created a black square in the center of the screen as a placeholder for what would later be a video stream. This was the result, located at http://10.0.0.20:

![Sample HTML Page with Black Square](./log_files/assets/ESP32CAM_BlackSquareSite.PNG)

Then, Step #2 was to take a picture or video stream and serve that as part of the HTML page, but in trying to send a single JPG over HTTP, I found it was just easier to send a stream of them and embed that stream into my HTML page where the black square is. So here we have a working HTTP server on the local wifi network, which serves a stream of JPGs showing whatever the ESP32 CAM is looking at:

```C++
// ESP32-CAM HTTP Server Streaming

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// Replace with your network credentials
const char* ssid     = "yourNetworkSSID";
const char* password = "yourNetworkPassword";

WebServer server(80);

// Camera configuration (AI Thinker module)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// HTML for root page with embedded stream
const char* htmlRoot = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESP32-CAM Stream</title>
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #222; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <img src="/stream" alt="Camera Stream">
</body>
</html>
)rawliteral";

// Serve root page
void handleRoot() {
  server.send(200, "text/html", htmlRoot);
}

// MJPEG stream handler
void handleJPGStream() {
  WiFiClient client = server.client();
  String header = "HTTP/1.1 200 OK\r\n";
  header += "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n";
  server.sendContent(header);

  // This loop runs until client disconnects. Ergo, one client per camera at a time.
  while (client.connected()) {
    // Capture frame buffer
    camera_fb_t *fb = esp_camera_fb_get();
    // Check for failed buffer capture. Can occur if memory is in short supply.
    if (!fb) {
      Serial.println("Camera capture failed");
      break;
    }

    String part = "--frame\r\n";
    part += "Content-Type: image/jpeg\r\n";
    part += "Content-Length: " + String(fb->len) + "\r\n\r\n";
    server.sendContent(part);

    // Write frame directly from RAM to client over TCP connection. This means we don't have to create frame copies in RAM or SD card, maximizes efficiency.
    client.write(fb->buf, fb->len);
    server.sendContent("\r\n");
    // Release the memory taken by the frame buffer.
    esp_camera_fb_return(fb);
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize camera variables
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count     = 1;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Camera init failed");
    while (true);
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }

  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());

  // Setup HTTP routes
  // The root directory serves the HTML above.
  server.on("/", HTTP_GET, handleRoot);
  // The /stream directory serves a stream of JPGs. It is called from within the HTML page above.
  server.on("/stream", HTTP_GET, handleJPGStream);
  server.onNotFound([](){ server.send(404, "text/plain", "Not Found"); });
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}
```

There you have it. The video is blurry and can lag at times, but it's a homemade security cam system made in under an hour of work. Next I'll mount it on my wall, and maybe write a server system running on another computer that collects all the data streams at once from multiple cameras and combines them into a single security console.