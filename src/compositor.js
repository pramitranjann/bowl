import { CONFIG } from "./config.js";
import { STATES } from "./states.js";

export class Compositor {
  constructor(webcam) {
    this.webcam = webcam;
    this.dpr = 1;
    this.playerCanvas = document.createElement("canvas");
    this.playerCtx = this.playerCanvas.getContext("2d");
    this.maskCanvas = document.createElement("canvas");
    this.maskCtx = this.maskCanvas.getContext("2d");
    this.sceneCanvas = document.createElement("canvas");
    this.sceneCtx = this.sceneCanvas.getContext("2d");
  }

  resize(viewport) {
    this.dpr = Math.max(1, viewport.dpr ?? 1);
    for (const [canvas, ctx] of [
      [this.playerCanvas, this.playerCtx],
      [this.sceneCanvas, this.sceneCtx],
    ]) {
      canvas.width = Math.max(1, Math.round(viewport.width * this.dpr));
      canvas.height = Math.max(1, Math.round(viewport.height * this.dpr));
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }
  }

  hasWebcamFrame() {
    return (
      this.webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      this.webcam.videoWidth > 0 &&
      this.webcam.videoHeight > 0
    );
  }

  getPlayerFrame(viewport, frame, state) {
    if (state !== STATES.OPENING && state !== STATES.CALIBRATION) {
      return frame;
    }

    const maxWidth =
      viewport.width * (CONFIG.introPlayerMaxWidthRatio ?? 0.58);
    const maxHeight =
      viewport.height * (CONFIG.introPlayerMaxHeightRatio ?? 0.46);
    const fitScale = Math.min(maxWidth / frame.width, maxHeight / frame.height);
    const width = frame.width * fitScale;
    const height = frame.height * fitScale;
    const bottomInset =
      viewport.height * (CONFIG.introPlayerBottomInsetRatio ?? 0.08);
    return {
      x: (viewport.width - width) / 2,
      y: viewport.height - height - bottomInset,
      width,
      height,
    };
  }

  drawMirroredFrame(ctx, viewport, frame, alpha = 1) {
    if (!this.hasWebcamFrame()) {
      return;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(viewport.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      this.webcam,
      viewport.width - frame.x - frame.width,
      frame.y,
      frame.width,
      frame.height
    );
    ctx.restore();
  }

  drawLiteBackground(ctx, viewport, frame) {
    ctx.fillStyle = "#0f0f0d";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    if (this.hasWebcamFrame()) {
      this.drawMirroredFrame(ctx, viewport, frame, 0.92);
    }
    ctx.save();
    ctx.fillStyle = CONFIG.liteBackgroundTint;
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.restore();
  }

  drawPlayer(ctx, viewport, frame, segmentation, state) {
    if (!this.hasWebcamFrame()) {
      return;
    }
    const playerFrame = this.getPlayerFrame(viewport, frame, state);
    if (!segmentation?.data) {
      this.drawMirroredFrame(ctx, viewport, playerFrame, 0.68);
      return;
    }

    this.playerCtx.clearRect(0, 0, viewport.width, viewport.height);
    this.drawMirroredFrame(this.playerCtx, viewport, playerFrame);

    const maskWidth = segmentation.width;
    const maskHeight = segmentation.height;
    const maskImage = this.maskCtx.createImageData(maskWidth, maskHeight);
    const threshold =
      (segmentation.maxValue ?? 1) <= 1
        ? CONFIG.maskAlphaThreshold
        : CONFIG.maskAlphaThreshold * (segmentation.maxValue ?? 255);
    for (let i = 0; i < segmentation.data.length; i += 1) {
      const maskValue = segmentation.data[i] >= threshold ? 255 : 0;
      const index = i * 4;
      maskImage.data[index] = 255;
      maskImage.data[index + 1] = 255;
      maskImage.data[index + 2] = 255;
      maskImage.data[index + 3] = maskValue;
    }
    this.maskCanvas.width = maskWidth;
    this.maskCanvas.height = maskHeight;
    this.maskCtx.putImageData(maskImage, 0, 0);

    this.playerCtx.globalCompositeOperation = "destination-in";
    this.playerCtx.drawImage(
      this.maskCanvas,
      playerFrame.x,
      playerFrame.y,
      playerFrame.width,
      playerFrame.height
    );
    this.playerCtx.globalCompositeOperation = "source-over";

    ctx.drawImage(
      this.playerCanvas,
      0,
      0,
      this.playerCanvas.width,
      this.playerCanvas.height,
      0,
      0,
      viewport.width,
      viewport.height
    );
  }
}
