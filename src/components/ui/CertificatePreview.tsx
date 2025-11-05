import React from 'react';
import type { CertificateData } from '@/lib/certificate-generator';

interface CertificatePreviewProps {
  data: CertificateData;
  className?: string;
  borderVariant?: 'green' | 'gold' | 'silver';
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  data,
  className = '',
  borderVariant = 'green'
}) => {
  const bodyText = `For outstanding dedication and commitment to environmental conservation through active participation in the "${data.eventName}" event on ${data.eventDate}. Your efforts have made a significant impact on our community and the environment.`;

  const renderTemplate = () => {
    switch (borderVariant) {
      case 'gold':
        return renderOrnateTemplate();
      case 'silver':
        return renderGeometricTemplate();
      default:
        return renderDefaultTemplate();
    }
  };

  const renderDefaultTemplate = () => (
    <div className="certificate green-template">
      <div className="certificate-frame">
        <div className="corner-decoration top-left"></div>
        <div className="corner-decoration top-right"></div>
        <div className="corner-decoration bottom-left"></div>
        <div className="corner-decoration bottom-right"></div>
        <div className="side-border left"></div>
        <div className="side-border right"></div>
        <div className="side-border top"></div>
        <div className="side-border bottom"></div>
      </div>
      <div className="certificate-content">
        <div className="certificate-header">
          <div className="certificate-title">CERTIFICATE</div>
          <div className="certificate-subtitle">Of Appreciation</div>
          <div className="title-underline"></div>
        </div>
        <div className="certificate-main">
          <div className="certificate-intro">This certificate is presented to</div>
          <div className="recipient-name">{data.volunteerName}</div>
          <div className="certificate-body">{bodyText}</div>
        </div>
        <div className="certificate-footer">
          <div className="signatures-section">
            <div className="signature left">
              <div className="certificate-logo">
                <img src="/logo.png" alt={data.organizerName} className="logo-image" />
              </div>
            </div>
            <div className="signature right">
              <div className="signature-image">
                <img src="/Signature.jpg" alt="Signature" className="signature-img" />
              </div>
              <div className="signature-line"></div>
              <div className="signature-name">Firew Kefyalew</div>
              <div className="signature-title">General Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrnateTemplate = () => (
    <div className="certificate gold-template">
      <div className="ornate-frame">
        <div className="medallion top-left">
          <div className="medallion-inner">
            <div className="medallion-pattern"></div>
          </div>
        </div>
        <div className="medallion top-right">
          <div className="medallion-inner">
            <div className="medallion-pattern"></div>
          </div>
        </div>
        <div className="medallion bottom-left">
          <div className="medallion-inner">
            <div className="medallion-pattern"></div>
          </div>
        </div>
        <div className="medallion bottom-right">
          <div className="medallion-inner">
            <div className="medallion-pattern"></div>
          </div>
        </div>
        <div className="ornate-border top"></div>
        <div className="ornate-border bottom"></div>
        <div className="ornate-border left"></div>
        <div className="ornate-border right"></div>
        <div className="decorative-element top-center"></div>
        <div className="decorative-element bottom-center"></div>
        <div className="decorative-element left-center"></div>
        <div className="decorative-element right-center"></div>
      </div>
      <div className="certificate-content">
        <div className="certificate-header">
          <div className="ornate-title">CERTIFICATE</div>
          <div className="ornate-subtitle">Of Appreciation</div>
          <div className="ornate-divider"></div>
        </div>
        <div className="certificate-main">
          <div className="ornate-intro">This certificate is presented to</div>
          <div className="ornate-recipient">{data.volunteerName}</div>
          <div className="ornate-body">{bodyText}</div>
        </div>
        <div className="certificate-footer">
          <div className="ornate-signatures">
            <div className="ornate-signature left">
              <div className="certificate-logo">
                <img src="/logo.png" alt={data.organizerName} className="logo-image" />
              </div>
            </div>
            <div className="ornate-signature right">
              <div className="signature-image">
                <img src="/Signature.jpg" alt="Signature" className="signature-img" />
              </div>
              <div className="ornate-signature-line"></div>
              <div className="ornate-signature-name">Firew Kefyalew</div>
              <div className="ornate-signature-title">General Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeometricTemplate = () => (
    <div className="certificate silver-template">
      <div className="geometric-frame">
        <div className="geometric-corner top-left"></div>
        <div className="geometric-corner top-right"></div>
        <div className="geometric-corner bottom-left"></div>
        <div className="geometric-corner bottom-right"></div>
        <div className="geometric-border top"></div>
        <div className="geometric-border bottom"></div>
        <div className="geometric-border left"></div>
        <div className="geometric-border right"></div>
        <div className="hexagon top-left-hex"></div>
        <div className="hexagon top-right-hex"></div>
        <div className="hexagon bottom-left-hex"></div>
        <div className="hexagon bottom-right-hex"></div>
        <div className="diamond top-center"></div>
        <div className="diamond bottom-center"></div>
        <div className="diamond left-center"></div>
        <div className="diamond right-center"></div>
      </div>
      <div className="certificate-content">
        <div className="certificate-header">
          <div className="geometric-title">CERTIFICATE</div>
          <div className="geometric-subtitle">Of Appreciation</div>
          <div className="geometric-divider"></div>
        </div>
        <div className="certificate-main">
          <div className="geometric-intro">This certificate is presented to</div>
          <div className="geometric-recipient">{data.volunteerName}</div>
          <div className="geometric-body">{bodyText}</div>
        </div>
        <div className="certificate-footer">
          <div className="geometric-signatures">
            <div className="geometric-signature left">
              <div className="certificate-logo">
                <img src="/logo.png" alt={data.organizerName} className="logo-image" />
              </div>
            </div>
            <div className="geometric-signature right">
              <div className="signature-image">
                <img src="/Signature.jpg" alt="Signature" className="signature-img" />
              </div>
              <div className="geometric-signature-line"></div>
              <div className="geometric-signature-name">Firew Kefyalew</div>
              <div className="geometric-signature-title">General Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`certificate-container ${className}`}>
      {renderTemplate()}
      <CertificateStyles />
    </div>
  );
};

// Export styles as a string for use in temporary DOM elements
export const getCertificateStyles = (): string => {
  return `
    /* Base Container */
    .certificate-container {
    display: flex; 
    }

    /* Base Certificate */
    .certificate {
      width: 800px;
      height: 700px;
      background: white;
      position: relative;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.15),
        0 8px 25px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      border-radius: 16px;
      overflow: hidden;
    }

    /* ===== GREEN TEMPLATE ===== */
    .green-template .certificate-frame {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }

    .green-template .corner-decoration {
      position: absolute;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
      border-radius: 50%;
      z-index: 2;
    }

    .green-template .corner-decoration.top-left {
      top: -40px;
      left: -40px;
      box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }

    .green-template .corner-decoration.top-right {
      top: -40px;
      right: -40px;
      background: linear-gradient(225deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
      box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }

    .green-template .corner-decoration.bottom-left {
      bottom: -40px;
      left: -40px;
      background: linear-gradient(45deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
      box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }

    .green-template .corner-decoration.bottom-right {
      bottom: -40px;
      right: -40px;
      background: linear-gradient(315deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
      box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }

    .green-template .side-border {
      position: absolute;
      background: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #22c55e 100%);
      z-index: 1;
    }

    .green-template .side-border.left {
      left: 0;
      top: 60px;
      bottom: 60px;
      width: 4px;
      background: linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #22c55e 100%);
    }

    .green-template .side-border.right {
      right: 0;
      top: 60px;
      bottom: 60px;
      width: 4px;
      background: linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #22c55e 100%);
    }

    .green-template .side-border.top {
      top: 0;
      left: 60px;
      right: 60px;
      height: 4px;
    }

    .green-template .side-border.bottom {
      bottom: 0;
      left: 60px;
      right: 60px;
      height: 4px;
    }

    /* ===== GOLD TEMPLATE ===== */
    .gold-template {
      background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
    }

    .gold-template .ornate-frame {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }

    .gold-template .medallion {
      position: absolute;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%);
      border-radius: 50%;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gold-template .medallion.top-left {
      top: -50px;
      left: -50px;
      box-shadow: 0 12px 24px rgba(217, 119, 6, 0.4), inset 0 3px 6px rgba(255, 255, 255, 0.3);
    }

    .gold-template .medallion.top-right {
      top: -50px;
      right: -50px;
      background: linear-gradient(225deg, #d97706 0%, #b45309 50%, #92400e 100%);
      box-shadow: 0 12px 24px rgba(217, 119, 6, 0.4), inset 0 3px 6px rgba(255, 255, 255, 0.3);
    }

    .gold-template .medallion.bottom-left {
      bottom: -50px;
      left: -50px;
      background: linear-gradient(45deg, #d97706 0%, #b45309 50%, #92400e 100%);
      box-shadow: 0 12px 24px rgba(217, 119, 6, 0.4), inset 0 3px 6px rgba(255, 255, 255, 0.3);
    }

    .gold-template .medallion.bottom-right {
      bottom: -50px;
      right: -50px;
      background: linear-gradient(315deg, #d97706 0%, #b45309 50%, #92400e 100%);
      box-shadow: 0 12px 24px rgba(217, 119, 6, 0.4), inset 0 3px 6px rgba(255, 255, 255, 0.3);
    }

    .gold-template .medallion-inner {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .gold-template .medallion-pattern {
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, #92400e 0%, transparent 70%);
      border-radius: 50%;
    }

    .gold-template .ornate-border {
      position: absolute;
      background: linear-gradient(90deg, #d97706 0%, #b45309 50%, #d97706 100%);
      z-index: 1;
    }

    .gold-template .ornate-border.top {
      top: 0;
      left: 80px;
      right: 80px;
      height: 6px;
      background: linear-gradient(90deg, #d97706 0%, #fbbf24 25%, #d97706 50%, #fbbf24 75%, #d97706 100%);
    }

    .gold-template .ornate-border.bottom {
      bottom: 0;
      left: 80px;
      right: 80px;
      height: 6px;
      background: linear-gradient(90deg, #d97706 0%, #fbbf24 25%, #d97706 50%, #fbbf24 75%, #d97706 100%);
    }

    .gold-template .ornate-border.left {
      left: 0;
      top: 80px;
      bottom: 80px;
      width: 6px;
      background: linear-gradient(180deg, #d97706 0%, #fbbf24 25%, #d97706 50%, #fbbf24 75%, #d97706 100%);
    }

    .gold-template .ornate-border.right {
      right: 0;
      top: 80px;
      bottom: 80px;
      width: 6px;
      background: linear-gradient(180deg, #d97706 0%, #fbbf24 25%, #d97706 50%, #fbbf24 75%, #d97706 100%);
    }

    .gold-template .decorative-element {
      position: absolute;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
      border-radius: 50%;
      z-index: 1;
    }

    .gold-template .decorative-element.top-center {
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
    }

    .gold-template .decorative-element.bottom-center {
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
    }

    .gold-template .decorative-element.left-center {
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
    }

    .gold-template .decorative-element.right-center {
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }

    /* ===== SILVER TEMPLATE ===== */
    .silver-template {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    }

    .silver-template .geometric-frame {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }

    .silver-template .geometric-corner {
      position: absolute;
      width: 0;
      height: 0;
      z-index: 2;
    }

    .silver-template .geometric-corner.top-left {
      top: 0;
      left: 0;
      border-top: 60px solid #059669;
      border-right: 60px solid transparent;
    }

    .silver-template .geometric-corner.top-right {
      top: 0;
      right: 0;
      border-top: 60px solid #047857;
      border-left: 60px solid transparent;
    }

    .silver-template .geometric-corner.bottom-left {
      bottom: 0;
      left: 0;
      border-bottom: 60px solid #047857;
      border-right: 60px solid transparent;
    }

    .silver-template .geometric-corner.bottom-right {
      bottom: 0;
      right: 0;
      border-bottom: 60px solid #059669;
      border-left: 60px solid transparent;
    }

    .silver-template .geometric-border {
      position: absolute;
      background: linear-gradient(90deg, #059669 0%, #10b981 50%, #059669 100%);
      z-index: 1;
    }

    .silver-template .geometric-border.top {
      top: 0;
      left: 60px;
      right: 60px;
      height: 4px;
    }

    .silver-template .geometric-border.bottom {
      bottom: 0;
      left: 60px;
      right: 60px;
      height: 4px;
    }

    .silver-template .geometric-border.left {
      left: 0;
      top: 60px;
      bottom: 60px;
      width: 4px;
      background: linear-gradient(180deg, #059669 0%, #10b981 50%, #059669 100%);
    }

    .silver-template .geometric-border.right {
      right: 0;
      top: 60px;
      bottom: 60px;
      width: 4px;
      background: linear-gradient(180deg, #059669 0%, #10b981 50%, #059669 100%);
    }

    .silver-template .hexagon {
      position: absolute;
      width: 30px;
      height: 30px;
      background: #10b981;
      transform: rotate(45deg);
      z-index: 1;
    }

    .silver-template .hexagon.top-left-hex {
      top: 20px;
      left: 20px;
    }

    .silver-template .hexagon.top-right-hex {
      top: 20px;
      right: 20px;
    }

    .silver-template .hexagon.bottom-left-hex {
      bottom: 20px;
      left: 20px;
    }

    .silver-template .hexagon.bottom-right-hex {
      bottom: 20px;
      right: 20px;
    }

    .silver-template .diamond {
      position: absolute;
      width: 0;
      height: 0;
      border: 8px solid transparent;
      border-bottom: 12px solid #059669;
      z-index: 1;
    }

    .silver-template .diamond.top-center {
      top: 15px;
      left: 50%;
      transform: translateX(-50%);
    }

    .silver-template .diamond.bottom-center {
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%) rotate(180deg);
    }

    .silver-template .diamond.left-center {
      left: 15px;
      top: 50%;
      transform: translateY(-50%) rotate(90deg);
    }

    .silver-template .diamond.right-center {
      right: 15px;
      top: 50%;
      transform: translateY(-50%) rotate(-90deg);
    }

    /* ===== COMMON CONTENT STYLES ===== */
    .certificate-content {
      padding: 80px 60px 80px;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 3;
    }

    .certificate-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .certificate-logo {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo-image {
      max-width: 100px;
      max-height: 100px;
      object-fit: contain;
      margin-top: 20px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .certificate-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .certificate-footer {
      margin-top: auto;
      padding-top: 30px;
      padding-bottom: 40px;
    }

    /* Green Template Content */
    .green-template .certificate-title {
      font-size: 48px;
      font-weight: 900;
      color: #1a1a1a;
      font-family: 'Georgia', serif;
      margin-bottom: 8px;
      letter-spacing: 4px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .green-template .certificate-subtitle {
      font-size: 22px;
      color: #22c55e;
      font-family: 'Georgia', serif;
      font-style: italic;
      margin-bottom: 15px;
      font-weight: 500;
    }

    .green-template .title-underline {
      width: 200px;
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, #22c55e 50%, transparent 100%);
      margin: 0 auto;
      border-radius: 2px;
    }

    .green-template .certificate-intro {
      font-size: 16px;
      color: #4a4a4a;
      font-family: 'Georgia', serif;
      margin-bottom: 25px;
      font-style: italic;
    }

    .green-template .recipient-name {
      font-size: 36px;
      color: #1a1a1a;
      font-family: 'Brush Script MT', cursive;
      font-weight: normal;
      margin-bottom: 35px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      word-wrap: break-word;
      max-width: 90%;
    }

    .green-template .certificate-body {
      font-size: 14px;
      color: #4a4a4a;
      font-family: 'Georgia', serif;
      line-height: 1.8;
      max-width: 500px;
      margin: 0 auto;
      text-align: center;
      word-wrap: break-word;
    }

    /* Gold Template Content */
    .gold-template .ornate-title {
      font-size: 52px;
      font-weight: 900;
      color: #92400e;
      font-family: 'Times New Roman', serif;
      margin-bottom: 8px;
      letter-spacing: 6px;
      text-shadow: 3px 3px 6px rgba(146, 64, 14, 0.3);
    }

    .gold-template .ornate-subtitle {
      font-size: 24px;
      color: #d97706;
      font-family: 'Times New Roman', serif;
      font-style: italic;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .gold-template .ornate-divider {
      width: 300px;
      height: 4px;
      background: linear-gradient(90deg, transparent 0%, #d97706 25%, #fbbf24 50%, #d97706 75%, transparent 100%);
      margin: 0 auto;
      border-radius: 2px;
    }

    .gold-template .ornate-intro {
      font-size: 18px;
      color: #92400e;
      font-family: 'Times New Roman', serif;
      margin-bottom: 30px;
      font-style: italic;
      font-weight: 500;
    }

    .gold-template .ornate-recipient {
      font-size: 40px;
      color: #92400e;
      font-family: 'Brush Script MT', cursive;
      font-weight: normal;
      margin-bottom: 40px;
      text-shadow: 3px 3px 6px rgba(146, 64, 14, 0.2);
      word-wrap: break-word;
      max-width: 90%;
    }

    .gold-template .ornate-body {
      font-size: 15px;
      color: #92400e;
      font-family: 'Times New Roman', serif;
      line-height: 1.9;
      max-width: 550px;
      margin: 0 auto;
      text-align: center;
      word-wrap: break-word;
      font-weight: 500;
    }

    /* Silver Template Content */
    .silver-template .geometric-title {
      font-size: 50px;
      font-weight: 900;
      color: #047857;
      font-family: 'Arial', sans-serif;
      margin-bottom: 8px;
      letter-spacing: 5px;
      text-shadow: 2px 2px 4px rgba(4, 120, 87, 0.3);
    }

    .silver-template .geometric-subtitle {
      font-size: 23px;
      color: #059669;
      font-family: 'Arial', sans-serif;
      font-style: italic;
      margin-bottom: 18px;
      font-weight: 600;
    }

    .silver-template .geometric-divider {
      width: 250px;
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, #059669 30%, #10b981 50%, #059669 70%, transparent 100%);
      margin: 0 auto;
      border-radius: 2px;
    }

    .silver-template .geometric-intro {
      font-size: 17px;
      color: #047857;
      font-family: 'Arial', sans-serif;
      margin-bottom: 28px;
      font-style: italic;
      font-weight: 500;
    }

    .silver-template .geometric-recipient {
      font-size: 38px;
      color: #047857;
      font-family: 'Brush Script MT', cursive;
      font-weight: normal;
      margin-bottom: 38px;
      text-shadow: 2px 2px 4px rgba(4, 120, 87, 0.2);
      word-wrap: break-word;
      max-width: 90%;
    }

    .silver-template .geometric-body {
      font-size: 14px;
      color: #047857;
      font-family: 'Arial', sans-serif;
      line-height: 1.8;
      max-width: 520px;
      margin: 0 auto;
      text-align: center;
      word-wrap: break-word;
      font-weight: 500;
    }

    /* ===== SIGNATURES ===== */
    .signatures-section, .ornate-signatures, .geometric-signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .signature, .ornate-signature, .geometric-signature {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 140px;
    }

    .signature-image {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
    }

    .signature-img {
      max-width: 80px;
      max-height: 80px;
      width: auto;
      height: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
      opacity: 0.9;
    }

    .signature-line, .ornate-signature-line, .geometric-signature-line {
      width: 120px;
      height: 2px;
      background: #1a1a1a;
      margin-bottom: 8px;
      position: relative;
    }

    .signature-name, .ornate-signature-name, .geometric-signature-name {
      font-size: 14px;
      color: #1a1a1a;
      font-family: 'Georgia', serif;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .signature-title, .ornate-signature-title, .geometric-signature-title {
      font-size: 10px;
      color: #6b7280;
      font-family: 'Georgia', serif;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Ornate Signature Colors */
    .gold-template .ornate-signature-line {
      background: #92400e;
    }

    .gold-template .ornate-signature-name {
      color: #92400e;
    }

    .gold-template .ornate-signature-title {
      color: #b45309;
    }

    /* Geometric Signature Colors */
    .silver-template .geometric-signature-line {
      background: #047857;
    }

    .silver-template .geometric-signature-name {
      color: #047857;
    }

    .silver-template .geometric-signature-title {
      color: #059669;
    }
  `;
};

const CertificateStyles: React.FC = () => (
  <style>{getCertificateStyles()}</style>
);

export default CertificatePreview;

