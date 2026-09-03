import pytest
import numpy as np
from backend.services.sonar_pipeline import SonarPipelineService
from backend.services.ml_detector import PyTorchMarineDetector

def test_lee_filter_noise_reduction():
    """
    Tests that the Lee speckle noise filter preserves structure while reducing variance in flat regions.
    """
    # Create test image with flat background + speckle noise + edge
    np.random.seed(42)
    clean = np.ones((64, 64), dtype=np.float32) * 128.0
    clean[:, 32:] = 220.0  # Step edge representing acoustic shadow boundary
    
    # Add multiplicative speckle noise
    noise = np.random.normal(1.0, 0.25, clean.shape)
    noisy = np.clip(clean * noise, 0, 255).astype(np.uint8)

    filtered = SonarPipelineService.apply_lee_filter(noisy, window_size=5, noise_variance=0.25)

    assert filtered.shape == noisy.shape
    assert filtered.dtype == np.uint8
    # Noise variance in homogeneous region should decrease
    assert np.var(filtered[:, :25]) <= np.var(noisy[:, :25]) + 1e-3

def test_clahe_contrast_enhancement():
    """
    Tests that CLAHE enhances contrast range on low-contrast sonar data.
    """
    low_contrast = (np.ones((64, 64), dtype=np.uint8) * 100)
    low_contrast[20:40, 20:40] = 110  # Weak acoustic anomaly

    enhanced = SonarPipelineService.apply_clahe(low_contrast, clip_limit=2.0, tile_grid_size=4)
    assert enhanced.shape == low_contrast.shape
    # Dynamic range should be expanded
    assert (np.max(enhanced) - np.min(enhanced)) >= (np.max(low_contrast) - np.min(low_contrast))

def test_sss_waterfall_slicer():
    """
    Tests SSS waterfall along-track ping slicing and slant-range geometry.
    """
    fake_waterfall = np.zeros((1024, 600, 3), dtype=np.uint8)
    slices = SonarPipelineService.slice_sss_waterfall(
        fake_waterfall,
        slice_height=256,
        overlap_stride=128,
        slant_range_correction=True,
        towfish_altitude_m=10.0
    )
    assert len(slices) >= 6
    assert slices[0]["slice_index"] == 0
    assert slices[0]["port_swath_width_px"] == 300
    assert slices[0]["nadir_blind_zone_px"] > 0

def test_pytorch_detector_bounding_boxes():
    """
    Tests PyTorch / TorchVision detector outputting valid YOLO and COCO bounding boxes.
    """
    detector = PyTorchMarineDetector(backbone="mobilenet_v3_large")
    img = np.zeros((300, 400, 3), dtype=np.uint8)
    img[100:200, 150:280] = 255  # Target object

    yolo_boxes, coco_boxes, meta = detector.detect(img)
    assert len(yolo_boxes) >= 1
    assert len(coco_boxes) >= 1
    assert 0.0 <= yolo_boxes[0].x_center <= 1.0
    assert 0.0 <= yolo_boxes[0].y_center <= 1.0
    assert coco_boxes[0].score > 0.5
    assert meta["estimated_object_height_m"] > 0
