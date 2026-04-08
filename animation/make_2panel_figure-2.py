from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math

pdfmetrics.registerFont(TTFont("F", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("FB", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))

out = "/Users/llns2/Documents/GitHub/sram.github.io/front-page-figure-2.pdf"

# Neutral theme — transparent background, no colored accents
UI_BG = None          # transparent
UI_TEXT = "#111827"
UI_MUTED = "#6b7280"
PANEL_A = "#374151"   # neutral dark for axis labels
PANEL_B = "#374151"
OURS_FILL = "#4a9e5c"   # green for SRAM points
BASELINE_FILL = "#9ca3af"  # light gray for baselines
G,SL,RC,OC,TR,BK = "#4a9e5c","#9ca3af","#cc3333","#dd8822","#4a7ab5","#111827"

p1=[
  {"s":"SRAM-v1.0-30B","p":30,"o":71.33,"u":1},
  {"s":"SRAM-v0.1-8B","p":8,"o":56.98,"u":1},
  {"s":"DeepSeek-V3.2","p":685,"o":73.16},
  {"s":"Kimi-K2.5","p":1024,"o":70.89},
  {"s":"GLM-4.6","p":357,"o":60.69},
  {"s":"Tongyi-DeepResearch","p":30,"o":60.64},
  {"s":"MiroThinker-v1.5-30B","p":30,"o":74.21},
  {"s":"WebSailor-32B","p":32,"o":51.85},
  {"s":"WebSailor-7B","p":7,"o":32.76},
  {"s":"ASearcher-Web-QWQ-v2","p":32,"o":59.25},
  {"s":"ASearcher-Web-7B","p":7,"o":24.46},
  {"s":"A2FM","p":32,"o":51.39},
  {"s":"SimpleTIR-32B","p":32,"o":38.63},
  {"s":"SimpleTIR-7B","p":7,"o":30.85},
  {"s":"WebExplorer-8B","p":8,"o":54.66},
  {"s":"GPT-OSS-120B-high","p":120,"o":60.31},
]
g30=[
  {"s":"SRAM-v1.0-30B","t":5517.7,"o":71.33,"u":1},
  {"s":"MiroThinker-v1.5-30B","t":11295.2,"o":74.21},
  {"s":"Tongyi-DeepResearch","t":7431.8,"o":60.64},
  {"s":"WebSailor-32B","t":1055.2,"o":51.85},
  {"s":"ASearcher-Web-QWQ-v2","t":116752.9,"o":59.25},
  {"s":"SimpleTIR-32B","t":5174.8,"o":38.63},
  {"s":"A2FM","t":23424.8,"o":51.39},
  {"s":"Qwen3-30B-A3B-Thinking-2507","t":5410.1,"o":53.12},
]

W,H = 880,370
pad,gapH,yaW = 16,30,36
titleY=H-15; legY=H-20; subY=H-50
# More gap between top captions and plot panels.
pTop=H-50; pBot=38; pH=pTop-pBot
panW=(W-2*pad-gapH)/2
aPL=pad+yaW; aPR=pad+panW; aPW=aPR-aPL
bPL=pad+panW+gapH+yaW; bPR=pad+2*panW+gapH; bPW=bPR-bPL

aYmin,aYmax,aXmin,aXmax = 20,82,0.6,3.25
bYmin,bYmax,bxHi = 35,78,13000

def ax(p): return aPL+(math.log10(max(p,5))-aXmin)/(aXmax-aXmin)*aPW
def ay(v): return pBot+(v-aYmin)/(aYmax-aYmin)*pH
def bx(t): return bPL+(1-min(t,bxHi+500)/bxHi)*bPW
def by(v): return pBot+(v-bYmin)/(bYmax-bYmin)*pH

# Regression
reg=[m for m in p1 if not m.get("u")]
xs=[math.log10(m["p"]) for m in reg]; ys=[m["o"] for m in reg]; nr=len(xs)
mx=sum(xs)/nr; my=sum(ys)/nr
ssxx=sum((x-mx)**2 for x in xs); ssxy=sum((xs[i]-mx)*(ys[i]-my) for i in range(nr))
sl=ssxy/ssxx; ic=my-sl*mx
res=[ys[i]-(sl*xs[i]+ic) for i in range(nr)]
sd=math.sqrt(sum(r**2 for r in res)/(nr-2))

# Pareto
bl=sorted([m for m in g30 if not m.get("u")], key=lambda m:m["t"])
pareto=[]; best=-1
for m in bl:
    if m["o"]>best: pareto.append(m); best=m["o"]

cv=canvas.Canvas(out, pagesize=(W,H))
# transparent background — no fill rect

# Helper: dotted border
def dotted_rect(pl,pb,pw,ph):
    cv.setStrokeColor(HexColor("#000"));cv.setStrokeAlpha(0.08);cv.setLineWidth(0.4)
    cv.setDash(1,2)
    cv.rect(pl,pb,pw,ph,fill=0,stroke=1)
    cv.setDash();cv.setStrokeAlpha(1)

# TITLE (kept commented per request - we now place title on the web page)
# cv.setFont("FB",17); cv.setFillColor(HexColor(BK))
# cv.drawCentredString(W/2, titleY, "Overall Pass@1 (\u2191) Across Selected Systems")

# LEGEND
lg=18; ly=legY
items_c=[("SRAM (Ours)","FB",13,G,True),("Baselines","F",13,SL,False)]
ws=[14+pdfmetrics.stringWidth(t,fn,fs) for t,fn,fs,_,_ in items_c]
tw=sum(ws)+(len(ws)-1)*lg; lx=(W-tw)/2
for t,fn,fs,col,ours in items_c:
    cv.setFillColor(HexColor(OURS_FILL if ours else BASELINE_FILL)); cv.setFillAlpha(0.92)
    cv.circle(lx+5,ly+2,5.5,fill=1,stroke=0); cv.setFillAlpha(1)
    if ours: cv.setStrokeColor(HexColor(BK)); cv.setLineWidth(1.5); cv.circle(lx+5,ly+2,5.5,fill=0,stroke=1)
    cv.setFont("Helvetica-Bold" if ours else "Helvetica",fs)
    cv.setFillColor(HexColor(UI_TEXT) if ours else HexColor(UI_MUTED))
    cv.drawString(lx+14,ly-2,t); lx+=ws.pop(0)+lg

# Y LABEL
cv.saveState();cv.setFillColor(HexColor(UI_MUTED));cv.setFont("Helvetica-Bold",14)
cv.translate(pad-4,(pBot+pTop)/2);cv.rotate(90);cv.drawCentredString(0,0,"Overall Pass@1")
cv.restoreState()

# Subtitles removed — rendered on webpage instead

# DOTTED BORDERS
dotted_rect(aPL,pBot,aPW,pH)
dotted_rect(bPL,pBot,bPW,pH)

# TICKS + DOTTED HORIZONTAL GRIDS
for t in [20,30,40,50,60,70,80]:
    y=ay(t)
    cv.setStrokeColor(HexColor("#000"));cv.setStrokeAlpha(0.08);cv.setLineWidth(0.4)
    cv.setDash(1,2);cv.line(aPL,y,aPR,y);cv.setDash();cv.setStrokeAlpha(1)
    cv.setStrokeColor(HexColor("#999"));cv.setLineWidth(0.5);cv.line(aPL,y,aPL-3,y)
    cv.setFont("Helvetica-Bold",12);cv.setFillColor(HexColor(UI_MUTED));cv.drawRightString(aPL-6,y-3.5,f"{t:.0f}")
for t in [35,40,45,50,55,60,65,70,75]:
    y=by(t)
    cv.setStrokeColor(HexColor("#000"));cv.setStrokeAlpha(0.08);cv.setLineWidth(0.4)
    cv.setDash(1,2);cv.line(bPL,y,bPR,y);cv.setDash();cv.setStrokeAlpha(1)
    cv.setStrokeColor(HexColor("#999"));cv.setLineWidth(0.5);cv.line(bPL,y,bPL-3,y)
    cv.setFont("Helvetica-Bold",12);cv.setFillColor(HexColor(UI_MUTED));cv.drawRightString(bPL-6,y-3.5,f"{t:.0f}")

# X ticks
for v,l in [(7,"7B"),(30,"30B"),(100,"100B"),(350,"350B"),(700,"700B"),(1500,"1.5T")]:
    x=ax(v)
    if aPL-2<=x<=aPR+2:
        cv.setStrokeColor(HexColor("#999"));cv.setLineWidth(0.5);cv.line(x,pBot,x,pBot-3)
        cv.setFont("Helvetica-Bold",12);cv.setFillColor(HexColor(PANEL_A));cv.drawCentredString(x,pBot-13,l)
cv.setFont("Helvetica-Bold",13);cv.setFillColor(HexColor(PANEL_A))
cv.drawCentredString(aPL+aPW/2,pBot-28,"(log scale)")

for v,l in [(0,"0"),(2000,"2K"),(4000,"4K"),(6000,"6K"),(8000,"8K"),(10000,"10K"),(12000,"12K")]:
    x=bPL+(1-v/bxHi)*bPW
    if bPL-2<=x<=bPR+2:
        cv.setStrokeColor(HexColor("#999"));cv.setLineWidth(0.5);cv.line(x,pBot,x,pBot-3)
        cv.setFont("Helvetica-Bold",12);cv.setFillColor(HexColor(PANEL_B));cv.drawCentredString(x,pBot-13,l)
cv.setFont("Helvetica-Bold",13);cv.setFillColor(HexColor(PANEL_B))
# Requested: remove this axis caption from the image.
# cv.drawCentredString(bPL+bPW/2,pBot-28,"Num. Reasoning Tokens (\u2193)")

# TREND BAND + LINE
for si in range(50):
    lp1=aXmin+si*(aXmax-aXmin)/50; lp2=aXmin+(si+1)*(aXmax-aXmin)/50
    x1=aPL+(lp1-aXmin)/(aXmax-aXmin)*aPW; x2=aPL+(lp2-aXmin)/(aXmax-aXmin)*aPW
    yh1=ay(sl*lp1+ic+sd);yl1=ay(sl*lp1+ic-sd);yh2=ay(sl*lp2+ic+sd);yl2=ay(sl*lp2+ic-sd)
    yh1=max(pBot,min(pTop,yh1));yl1=max(pBot,min(pTop,yl1));yh2=max(pBot,min(pTop,yh2));yl2=max(pBot,min(pTop,yl2))
    p=cv.beginPath();p.moveTo(x1,yl1);p.lineTo(x1,yh1);p.lineTo(x2,yh2);p.lineTo(x2,yl2);p.close()
    cv.setFillColor(HexColor(TR));cv.setFillAlpha(0.1);cv.drawPath(p,fill=1,stroke=0);cv.setFillAlpha(1)
ry1=max(pBot,min(pTop,ay(sl*aXmin+ic)));ry2=max(pBot,min(pTop,ay(sl*aXmax+ic)))
cv.setStrokeColor(HexColor(TR));cv.setStrokeAlpha(0.5);cv.setLineWidth(1.5);cv.line(aPL,ry1,aPR,ry2);cv.setStrokeAlpha(1)
cv.setFont("FB",10);cv.setFillColor(HexColor("#5a6a7e"))
cv.drawRightString(aPR-4,ry2+7,"Overall Pass@1 vs. log(Param Size) trendline (\u00b11\u03c3)")

# GPT LINES
gy1=ay(78.26)
cv.setStrokeColor(HexColor(RC));cv.setStrokeAlpha(0.7);cv.setLineWidth(1.5)
cv.setDash(6,4);cv.line(aPL,gy1,aPR,gy1);cv.setDash();cv.setStrokeAlpha(1)
cv.setFont("FB",10.5);cv.setFillColor(HexColor(RC));cv.drawString(aPL+4,gy1+5,"GPT-5.4-xhigh")
gy2=ay(68.42)
cv.setStrokeColor(HexColor(OC));cv.setStrokeAlpha(0.7);cv.setLineWidth(1.5)
cv.setDash(6,4);cv.line(aPL,gy2,aPR,gy2);cv.setDash();cv.setStrokeAlpha(1)
cv.setFont("FB",10.5);cv.setFillColor(HexColor(OC));cv.drawString(aPL+4,gy2-11,"GPT-5.4-xhigh (Text-only)")

# POINTS helpers
def mk(cx,cy,u,r=None):
    if r is None: r=8 if u else 5.5
    cv.setFillColor(HexColor(OURS_FILL if u else BASELINE_FILL));cv.setFillAlpha(0.92 if u else 0.88)
    cv.circle(cx,cy,r,fill=1,stroke=0);cv.setFillAlpha(1)
    if u:
        cv.setStrokeColor(HexColor(BK));cv.setLineWidth(2)
        cv.circle(cx,cy,r,fill=0,stroke=1)

def txt(cx,cy,s,u,dx,dy,anc):
    fs_u=13; fs_b=10.5
    cv.setFont("FB" if u else "FB",fs_u if u else fs_b)
    cv.setFillColor(HexColor(BK if u else "#4a5a6e"))
    lx_,ly_=cx+dx,cy+dy-3
    if anc=="start": cv.drawString(lx_,ly_,s)
    elif anc=="end": cv.drawRightString(lx_,ly_,s)
    else: cv.drawCentredString(lx_,ly_,s)

# PANEL A
aOff={
  "SRAM-v1.0-30B":(9,7,"start"),
  "SRAM-v0.1-8B":(0,11,"middle"),
  "DeepSeek-V3.2":(-9,10,"end"),
  "Kimi-K2.5":(9,3,"start"),
  "GLM-4.6":(0,-13,"middle"),
  "GPT-OSS-120B-high":(0,11,"middle"),
  "Tongyi-DeepResearch":(18,10,"end"),
  "MiroThinker-v1.5-30B":(0,11,"middle"),
  "WebSailor-32B":(0,-13,"middle"),
  "WebSailor-7B":(0,10,"middle"),
  "ASearcher-Web-QWQ-v2":(0,-13,"middle"),
  "ASearcher-Web-7B":(9,0,"start"),
  "A2FM":(9,3,"start"),
  "SimpleTIR-32B":(9,-7,"start"),
  "SimpleTIR-7B":(0,-13,"middle"),
  "WebExplorer-8B":(0,-13,"middle"),
}
for m in sorted(p1,key=lambda m:m.get("u",0)):
    cx,cy=ax(m["p"]),ay(m["o"]); mk(cx,cy,m.get("u"))
    dx,dy,anc=aOff.get(m["s"],(9,0,"start")); txt(cx,cy,m["s"],m.get("u"),dx,dy,anc)

# PARETO with gradient shade (contained within line range, darker near line)
if len(pareto)>=2:
    pareto_coords = []
    for m in pareto:
        px = max(bPL, min(bPR, bx(m["t"])))
        py = max(pBot, min(pTop, by(m["o"])))
        pareto_coords.append((px, py))

    # Smooth gradient shade using rasterized PNG
    # Generate a smooth gradient image and embed it
    from PIL import Image
    import numpy as np

    # Image covers panel (b) area
    img_w = int(bPW + 1)
    img_h = int(pH + 1)
    img = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 0))
    pixels = np.zeros((img_h, img_w, 4), dtype=np.uint8)

    # Convert pareto_coords to image coords (origin top-left)
    pc_img = []
    for px, py in pareto_coords:
        ix = px - bPL
        iy = pTop - py  # flip: pTop is top of plot = y=0 in image
        pc_img.append((ix, iy))

    # Peak point in image coords
    x_left, y_left = pareto_coords[-1]
    x_right, y_right = pareto_coords[0]
    mid_idx = len(pareto_coords) // 2
    x_mid, y_mid = pareto_coords[mid_idx]
    peak_x_img = (x_left + x_right) / 2 - bPL
    peak_y_img = pTop - min(pTop, y_mid + 75)

    # For each pixel, compute if it's in the triangular gradient region
    # and how far from the frontier
    green_r, green_g, green_b = 0x4a, 0x9e, 0x5c

    # Interpolate frontier y at a given x
    def frontier_y_at_x(x_img):
        # pc_img sorted by x (rightmost first in plot = leftmost in image)
        for i in range(len(pc_img) - 1):
            x0, y0 = pc_img[i]
            x1, y1 = pc_img[i + 1]
            if x0 > x1: x0, y0, x1, y1 = x1, y1, x0, y0
            if x0 <= x_img <= x1:
                t = (x_img - x0) / (x1 - x0) if x1 != x0 else 0
                return y0 + t * (y1 - y0)
        return None

    # X range of frontier
    xs_front = [c[0] for c in pc_img]
    x_min_f, x_max_f = max(0, min(xs_front) - 15), min(img_w-1, max(xs_front) + 15)

    for iy in range(img_h):
        for ix in range(img_w):
            if ix < x_min_f or ix > x_max_f:
                continue
            fy = frontier_y_at_x(max(min(xs_front), min(max(xs_front), ix)))
            if fy is None:
                continue
            # Only shade above the frontier (iy < fy in image coords means above in plot)
            if iy >= fy:
                continue

            # Distance above frontier
            dist_above = fy - iy

            # How far from center horizontally (normalized)
            x_center = (x_min_f + x_max_f) / 2
            x_range = (x_max_f - x_min_f) / 2
            x_norm = abs(ix - x_center) / x_range if x_range > 0 else 1

            # Triangular envelope: max height tapers at edges
            max_height = 130 * (1 - x_norm ** 1.3)
            if dist_above > max_height or max_height <= 0:
                continue

            # Smooth falloff
            frac = dist_above / max_height
            alpha = 0.32 * (1 - frac) ** 1.5 * (1 - x_norm ** 2) ** 0.6

            alpha = max(0, min(1, alpha))
            pixels[iy, ix] = (green_r, green_g, green_b, int(alpha * 255))

    img = Image.fromarray(pixels, "RGBA")
    grad_path = "/tmp/pareto_grad.png"
    img.save(grad_path)

    # Embed into PDF
    cv.saveState()
    # Clip to panel (b)
    clip = cv.beginPath()
    clip.rect(bPL, pBot, bPW, pH)
    cv.clipPath(clip, stroke=0)
    cv.drawImage(grad_path, bPL, pBot, width=bPW, height=pH, mask='auto')
    cv.restoreState()

    # Draw the Pareto line
    cv.setStrokeColor(HexColor(SL));cv.setStrokeAlpha(0.55);cv.setLineWidth(1.8);cv.setDash(5,3)
    for i in range(len(pareto_coords)-1):
        cv.line(pareto_coords[i][0], pareto_coords[i][1], pareto_coords[i+1][0], pareto_coords[i+1][1])
    cv.setDash();cv.setStrokeAlpha(1)

    # Label
    plx, ply = pareto_coords[-1]
    cv.setFont("FB",10);cv.setFillColor(HexColor("#5a6a7e"))
    cv.drawString(plx-4,ply+16,"Pareto frontier (baselines)")

# PANEL B
bOff={
  "SRAM-v1.0-30B":(9,7,"start"),
  "MiroThinker-v1.5-30B":(9,4,"start"),
  "Tongyi-DeepResearch":(9,5,"start"),
  "WebSailor-32B":(0,11,"middle"),
  "ASearcher-Web-QWQ-v2":(9,3,"start"),
  "SimpleTIR-32B":(0,11,"middle"),
  "A2FM":(9,3,"start"),
  "Qwen3-30B-A3B-Thinking-2507":(0,-13,"middle"),
}
for m in sorted(g30,key=lambda m:m.get("u",0)):
    cx=max(bPL+4,min(bPR-4,bx(m["t"])));cy=max(pBot+4,min(pTop-4,by(m["o"])))
    mk(cx,cy,m.get("u")); dx,dy,anc=bOff.get(m["s"],(9,0,"start")); txt(cx,cy,m["s"],m.get("u"),dx,dy,anc)
    if m["t"]>bxHi and not m.get("u"):
        cv.setFont("F",9);cv.setFillColor(HexColor("#4a5a6e"))
        cv.drawString(cx+9,cy-11,f"({m['t']/1000:.0f}K tokens)")

cv.save()
print(f"PDF saved: {W} x {H} pts")
