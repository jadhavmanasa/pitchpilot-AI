import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PitchDeck } from "../types";
import { getSlideImageUrls, preloadImage } from "./slideImages";
import { getSlideTemplate } from "./slideTemplates";

export async function downloadDeckAsPDF(deck: PitchDeck) {
  const template = getSlideTemplate(deck.templateId);
  // We need a temporary container to render slides for capture
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1280px"; // 16:9 aspect ratio base
  container.style.background = template.pdf.background;
  document.body.appendChild(container);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1280, 720]
  });

  try {
    for (let i = 0; i < deck.slides.length; i++) {
       const slide = deck.slides[i];
       
       // Create a temporary slide element
       const slideEl = document.createElement("div");
       slideEl.style.width = "1280px";
       slideEl.style.height = "720px";
       slideEl.style.position = "relative";
       slideEl.style.padding = "60px";
       slideEl.style.display = "flex";
       slideEl.style.flexDirection = "column";
       slideEl.style.justifyContent = "center";
       slideEl.style.background = template.pdf.background;
       slideEl.style.color = template.pdf.title;
       slideEl.style.fontFamily = "sans-serif";
       slideEl.style.overflow = "hidden";

       const accentBar = document.createElement("div");
       accentBar.style.position = "absolute";
       accentBar.style.left = "60px";
       accentBar.style.top = "38px";
       accentBar.style.width = "140px";
       accentBar.style.height = "8px";
       accentBar.style.borderRadius = "999px";
       accentBar.style.background = template.pdf.accent;
       slideEl.appendChild(accentBar);

       const typeLabel = document.createElement("div");
       typeLabel.innerText = slide.type;
       typeLabel.style.position = "absolute";
       typeLabel.style.left = "60px";
       typeLabel.style.top = "58px";
       typeLabel.style.color = template.pdf.accent;
       typeLabel.style.fontSize = "13px";
       typeLabel.style.fontWeight = "900";
       typeLabel.style.letterSpacing = "3px";
       typeLabel.style.textTransform = "uppercase";
       slideEl.appendChild(typeLabel);
       
       // Title
       const title = document.createElement("h1");
       title.innerText = slide.title;
       title.style.width = "700px";
       title.style.fontSize = "56px";
       title.style.fontWeight = "900";
       title.style.marginBottom = "20px";
       title.style.textTransform = "uppercase";
       title.style.lineHeight = "1";
       title.style.color = template.pdf.title;
       slideEl.appendChild(title);
       
       // Subtitle
       const subtitle = document.createElement("p");
       subtitle.innerText = slide.subtitle;
       subtitle.style.width = "650px";
       subtitle.style.fontSize = "24px";
       subtitle.style.color = template.pdf.subtitle;
       subtitle.style.marginBottom = "40px";
       subtitle.style.lineHeight = "1.35";
       slideEl.appendChild(subtitle);
       
       // Content
       const list = document.createElement("ul");
       list.style.listStyle = "none";
       list.style.padding = "0";
       list.style.margin = "0";
       list.style.width = "640px";
       slide.content.slice(0, 6).forEach(item => {
         const li = document.createElement("li");
         li.innerText = `- ${item}`;
         li.style.fontSize = "18px";
         li.style.marginBottom = "13px";
         li.style.lineHeight = "1.35";
         li.style.color = template.pdf.body;
         list.appendChild(li);
       });
       slideEl.appendChild(list);

       if (slide.visualData) {
         const chartPanel = document.createElement("div");
         chartPanel.style.position = "absolute";
         chartPanel.style.right = "60px";
         chartPanel.style.top = "166px";
         chartPanel.style.width = "470px";
         chartPanel.style.height = "390px";
         chartPanel.style.borderRadius = "22px";
         chartPanel.style.border = `1px solid ${template.pdf.border}`;
         chartPanel.style.background = template.pdf.panel;
         chartPanel.style.padding = "28px";
         chartPanel.style.display = "flex";
         chartPanel.style.flexDirection = "column";
         chartPanel.style.justifyContent = "flex-end";
         chartPanel.style.gap = "16px";

         const maxValue = Math.max(...slide.visualData.data.map((item) => item.value), 1);
         slide.visualData.data.slice(0, 6).forEach((item, itemIndex) => {
           const row = document.createElement("div");
           row.style.display = "grid";
           row.style.gridTemplateColumns = "105px 1fr 44px";
           row.style.alignItems = "center";
           row.style.gap = "12px";
           row.style.color = template.pdf.body;
           row.style.fontSize = "15px";
           row.style.fontWeight = "700";

           const label = document.createElement("span");
           label.innerText = item.name;
           label.style.overflow = "hidden";
           label.style.textOverflow = "ellipsis";
           label.style.whiteSpace = "nowrap";

           const track = document.createElement("span");
           track.style.height = "16px";
           track.style.borderRadius = "999px";
           track.style.background = template.pdf.border;
           track.style.overflow = "hidden";

           const bar = document.createElement("span");
           bar.style.display = "block";
           bar.style.width = `${Math.max(10, (item.value / maxValue) * 100)}%`;
           bar.style.height = "100%";
           bar.style.borderRadius = "999px";
           bar.style.background = template.chartColors[itemIndex % template.chartColors.length];
           track.appendChild(bar);

           const value = document.createElement("span");
           value.innerText = String(item.value);
           value.style.textAlign = "right";
           value.style.color = template.pdf.muted;

           row.append(label, track, value);
           chartPanel.appendChild(row);
         });

         slideEl.appendChild(chartPanel);
       } else {
         const imageUrls = getSlideImageUrls(slide, i + 1, 800, 600);
         let resolvedImageUrl = "";

         for (const imageUrl of imageUrls) {
           try {
             resolvedImageUrl = await preloadImage(imageUrl);
             break;
           } catch {
             // Try the next provider URL.
           }
         }

         if (!resolvedImageUrl) {
           throw new Error(`Could not load image for slide ${i + 1}.`);
         }

         const img = document.createElement("img");
         img.style.position = "absolute";
         img.style.right = "60px";
         img.style.top = "180px";
         img.style.width = "500px";
         img.style.height = "350px";
         img.style.borderRadius = "20px";
         img.style.border = `1px solid ${template.pdf.border}`;
         img.style.objectFit = "cover";
         img.crossOrigin = "anonymous";
         img.src = resolvedImageUrl;
         slideEl.appendChild(img);
       }

       // Footer
       const footer = document.createElement("div");
       footer.style.marginTop = "auto";
       footer.style.paddingTop = "20px";
       footer.style.borderTop = `1px solid ${template.pdf.border}`;
       footer.style.display = "flex";
       footer.style.justifyContent = "space-between";
       footer.style.fontSize = "12px";
       footer.style.color = template.pdf.muted;
       footer.innerHTML = `<span>Built with PitchPilot AI</span><span>${template.name} - Slide ${i + 1}/${deck.slides.length}</span>`;
       slideEl.appendChild(footer);

       container.appendChild(slideEl);
       
       const canvas = await html2canvas(slideEl, { 
         backgroundColor: template.pdf.background,
         scale: 2, // Better quality
         width: 1280,
         height: 720,
         useCORS: true
       });
       
       const imgData = canvas.toDataURL("image/jpeg", 0.95);
       
       if (i > 0) pdf.addPage([1280, 720], "landscape");
       pdf.addImage(imgData, "JPEG", 0, 0, 1280, 720);
       
       container.removeChild(slideEl);
    }

    pdf.save(`${deck.startupName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
  } finally {
    document.body.removeChild(container);
  }
}
