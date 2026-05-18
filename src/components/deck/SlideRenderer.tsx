import { useEffect, useMemo, useState } from "react";
import { Slide, SlideTemplateId } from "../../types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, AreaChart, Area } from "recharts";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { getSlideImageUrls } from "../../lib/slideImages";
import { getSlideTemplate } from "../../lib/slideTemplates";
import { cn } from "../../lib/utils";

export default function SlideRenderer({ slide, slideNumber, totalSlides, templateId }: { slide: Slide, slideNumber?: number, totalSlides?: number, templateId?: SlideTemplateId }) {
  const template = getSlideTemplate(templateId);
  const COLORS = template.chartColors;
  const visibleContent = slide.content.slice(0, 6);
  const hiddenContentCount = Math.max(slide.content.length - visibleContent.length, 0);
  const imageUrls = useMemo(() => {
    return getSlideImageUrls(slide, slideNumber || 1);
  }, [slide, slideNumber]);
  const [imageUrlIndex, setImageUrlIndex] = useState(0);
  const imageUrl = imageUrls[imageUrlIndex];

  useEffect(() => {
    setImageUrlIndex(0);
  }, [imageUrls]);

  const handleImageError = () => {
    setImageUrlIndex((currentIndex) => Math.min(currentIndex + 1, imageUrls.length));
  };

  const tooltipStyle = {
    backgroundColor: template.chartTooltipBg,
    borderColor: template.chartTooltipBorder,
    borderRadius: '16px',
    border: `1px solid ${template.chartTooltipBorder}`,
  };

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-5 md:p-6 xl:p-7", template.frameClass)}>
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r", template.edgeClass)} />
      
      <div className="relative z-10 mb-3 flex shrink-0 flex-col md:mb-4">
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           className={cn("mb-2 inline-block w-fit rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest sm:text-[9px]", template.badgeClass)}
        >
          {slide.type}
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mb-1 max-w-4xl font-display text-xl font-black leading-[1.05] tracking-tight line-clamp-2 sm:text-2xl md:text-3xl xl:text-[2.35rem]", template.titleClass)}
        >
          {slide.title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn("max-w-2xl text-[9px] font-semibold leading-snug line-clamp-2 sm:text-[10px] md:text-xs", template.subtitleClass)}
        >
          {slide.subtitle}
        </motion.p>
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] items-stretch gap-3 overflow-hidden md:gap-5">
        <div className="grid min-h-0 auto-rows-fr gap-1.5 overflow-hidden py-0.5 md:gap-2">
          {visibleContent.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className={cn("group flex min-h-0 items-start gap-1.5 rounded-lg border p-1.5 transition-all sm:gap-2 md:p-2", template.bulletClass)}
            >
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className={cn("h-3 w-3 transition-transform group-hover:scale-110 md:h-3.5 md:w-3.5", template.bulletIconClass)} />
              </div>
              <p className={cn("min-w-0 text-[7px] font-medium leading-snug line-clamp-2 transition-colors sm:text-[8px] md:text-[9px] xl:text-[10px]", template.subtitleClass)}>
                {item}
              </p>
            </motion.div>
          ))}
          {hiddenContentCount > 0 && (
            <div className={cn("flex items-center rounded-lg border px-2 text-[8px] font-extrabold uppercase tracking-widest sm:text-[9px]", template.moreClass)}>
              +{hiddenContentCount} more point{hiddenContentCount > 1 ? "s" : ""} in speaker notes
            </div>
          )}
        </div>

        {slide.visualData ? (
          <motion.div
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5 }}
             className={cn("group relative flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-2xl border p-2 backdrop-blur-3xl md:gap-3 md:p-3", template.visualPanelClass)}
          >
            <div className={cn("relative z-10 min-h-0 flex-[1.05] w-full rounded-xl p-1.5 md:p-2", template.chartPanelClass)}>
              <ResponsiveContainer width="100%" height="100%">
                {slide.visualData.chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={slide.visualData.data}
                      innerRadius="42%"
                      outerRadius="72%"
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {slide.visualData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: template.pdf.title, fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ display: 'none' }}
                    />
                  </PieChart>
                ) : slide.visualData.chartType === 'line' ? (
                   <LineChart data={slide.visualData.data}>
                     <XAxis dataKey="name" stroke={template.chartTick} fontSize={8} axisLine={false} tickLine={false} dy={8} />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={tooltipStyle}
                       itemStyle={{ color: template.pdf.title, fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Line type="monotone" dataKey="value" stroke={template.accent} strokeWidth={3} dot={{ fill: template.accent, strokeWidth: 2, r: 3 }} />
                   </LineChart>
                ) : slide.visualData.chartType === 'area' ? (
                   <AreaChart data={slide.visualData.data}>
                     <XAxis dataKey="name" stroke={template.chartTick} fontSize={8} axisLine={false} tickLine={false} dy={8} />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={tooltipStyle}
                       itemStyle={{ color: template.pdf.title, fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="value" stroke={template.accent} fill="url(#colorValue)" />
                     <defs>
                       <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor={template.accent} stopOpacity={0.35}/>
                         <stop offset="95%" stopColor={template.accent} stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                   </AreaChart>
                ) : (
                  <BarChart data={slide.visualData.data}>
                    <XAxis dataKey="name" stroke={template.chartTick} fontSize={8} axisLine={false} tickLine={false} dy={8} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: template.pdf.title, fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: template.pdf.muted, fontSize: '10px', marginBottom: '4px' }}
                    />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={24}>
                      {slide.visualData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className={cn("relative z-10 min-h-0 flex-[0.95] w-full overflow-hidden rounded-xl border", template.imagePanelClass)}>
              <img
                src={imageUrl}
                alt={slide.title}
                className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </motion.div>
        ) : (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className={cn("group relative h-full min-h-0 overflow-hidden rounded-2xl border", template.imagePanelClass)}
           >
              <img
                src={imageUrl}
                alt={slide.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                 <p className="text-[7px] font-bold uppercase leading-relaxed tracking-widest text-white/40 line-clamp-2">{slide.imagePrompt}</p>
              </div>
           </motion.div>
        )}
      </div>

      <div className={cn("relative z-10 mt-2 flex shrink-0 items-center justify-between border-t pt-2 md:mt-3 md:pt-3", template.footerClass)}>
         <span className={cn("text-[7px] font-bold uppercase tracking-[0.2em] sm:text-[8px] md:text-[9px]", template.footerMutedClass)}>Built with PitchPilot AI</span>
         <div className="flex gap-3 md:gap-5">
            <span className={cn("text-[7px] font-bold uppercase tracking-widest sm:text-[8px] md:text-[9px]", template.footerMutedClass)}>Confidential</span>
            <span className={cn("text-[7px] font-bold uppercase tracking-widest sm:text-[8px] md:text-[9px]", template.footerMutedClass)}>Slide {slideNumber || '00'}/{totalSlides || '10'}</span>
         </div>
      </div>
    </div>
  );
}
