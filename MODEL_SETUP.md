# MarineSight AI — Sonar ML Model Setup & Architecture Guide

## 1. Deep Learning Architecture Overview

MarineSight AI integrates a **Faster R-CNN with MobileNetV3-Large FPN (Feature Pyramid Network)** deep learning architecture designed specifically for Side-Scan Sonar (SSS) acoustic anomaly detection:

- **Backbone**: MobileNetV3-Large with multi-scale feature pyramids (FPN) to capture acoustic reverberations across varied spatial scales.
- **Region Proposal Network (RPN)**: Generates candidate bounding boxes tuned for low-aspect benthic debris.
- **RoI Box Head**: Fast R-CNN box predictor head fine-tuned for marine debris taxonomy classes with background suppression.
- **Augmentation Pipeline**: Powered by Albumentations with synthetic acoustic speckle noise (`GaussNoise`), Rayleigh fading, horizontal flip, and motion blur.

---

## 2. Taxonomy Classes

The model detects 6 primary marine debris and underwater obstacle classes:

| Class ID | Class Name | Risk Rating | Acoustic Signature |
|:---|:---|:---|:---|
| **0** | Ghost Fishing Gear | CRITICAL | High-intensity backscatter highlight followed by elongated acoustic shadow void |
| **1** | Derelict Wire Trap | HIGH | Geometric hard-target rectangular frame resonance with right-angle void |
| **2** | Plastic Container | MEDIUM | Diffuse backscatter with short trailing shadow on sandy substrate |
| **3** | Synthetic Monofilament Line | CRITICAL | Thin linear acoustic return with trailing micro-shadows |
| **4** | Submerged Industrial Debris | HIGH | High acoustic reflectivity with sharp angular shadow boundary |
| **5** | Sunken Wood & Organic Snag | LOW | Irregular natural backscatter with soft acoustic transition |

---

## 3. Checkpoint Weights Configuration

The detector looks for trained PyTorch weights at:
1. `SONAR_CHECKPOINT_PATH` environment variable (if specified in `.env`)
2. `./weights/sonar_faster_rcnn_mobilenet.pth` (standard project location)
3. `./weights/best_sonar.pt`

### Graceful Fallback Without Weight Fabrication

> **Ethical ML Directive**: MarineSight AI **never fabricates weights** or pretends an untrained checkpoint is trained.

- **When Checkpoint is Present**:
  - The detector executes `torch.load(...)` and sets the model to evaluation mode (`model.eval()`).
  - Tensor inference runs with `torch.no_grad()`, producing class predictions and bounding boxes directly from the neural network.
  - Response metadata indicates: `checkpoint_loaded: true`, `inference_engine: "PyTorch Faster R-CNN MobileNetV3-FPN"`.

- **When Checkpoint is Not Present**:
  - The detector logs a diagnostic notice:  
    `"PyTorch Faster R-CNN MobileNetV3-Large FPN initialized. Trained checkpoint not found at ./weights/sonar_faster_rcnn_mobilenet.pth. Operating in calibrated acoustic-shadow backscatter mode without fabricating weights."`
  - The system executes calibrated hydroacoustic shadow geometry to extract objects and calculate relief height:
    $$H_{\text{object}} = \frac{L_{\text{shadow}} \cdot H_{\text{towfish}}}{R_{\text{slant}}}$$
  - Response metadata indicates: `checkpoint_loaded: false`, `inference_engine: "Acoustic-Shadow Geometry Engine (Awaiting .pth Checkpoint)"`.

---

## 4. How to Add Trained Model Weights

To enable trained PyTorch inference:

1. Create a `weights/` folder in the root directory (if not already present):
   ```bash
   mkdir -p weights
   ```
2. Place your trained PyTorch state dictionary file inside:
   ```bash
   cp /path/to/your/trained_weights.pth weights/sonar_faster_rcnn_mobilenet.pth
   ```
3. Alternatively, specify the path in your `.env` file:
   ```env
   SONAR_CHECKPOINT_PATH="/path/to/my_custom_weights.pth"
   ```
4. Restart the backend or dev server. The system will automatically detect and load the weights on startup.

---

## 5. Acoustic Preprocessing Pipeline

Before inference, the Side-Scan Sonar pipeline applies:
1. **Lee Adaptive Speckle Noise Filter**:
   $$W = 1 - \frac{\sigma_{\text{noise}}^2}{\sigma_{\text{local}}^2}, \quad I_{\text{filtered}} = \mu_{\text{local}} + W \cdot (I - \mu_{\text{local}})$$
   Removes acoustic speckle noise while preserving sharp boundaries between seabed returns and acoustic shadows.
2. **CLAHE (Contrast Limited Adaptive Histogram Equalization)**:
   Normalizes dynamic range and amplifies faint ghost net returns against dark seafloor voids.
