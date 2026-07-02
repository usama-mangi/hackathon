# Design Specifications

### "Bluneo.ai" Landing Page Inspiration

### 1. Overview and Aesthetic
This landing page design embodies a modern, premium "Dark Mode" aesthetic, heavily utilized by cutting-edge AI and tech companies. The design balances a stark, minimalist typographical layout with a highly engaging, continuous 3D animation.

**Core Themes:**
* **Intelligent & Futuristic:** Communicated through the dark background, glowing vibrant blue accents, and abstract 3D elements.
* **Balance & Stability:** The 3D animation of balancing discs visually reinforces the headline "Automate the complex."
* **Minimalist Clarity:** High contrast between text and background ensures immediate readability.

---

### 2. Color Palette
* **Background:** Deep Black (`#000000` or `#050505`). Creates an infinite canvas feel.
* **Primary Accent:** Vibrant Electric Blue (`#2563EB` to `#0055FF` range). Used for Call-to-Action (CTA) buttons and the 3D graphic. This color pops dramatically against the dark background.
* **Primary Text:** Pure White (`#FFFFFF`). Used for the logo, main headings, and primary navigation.
* **Secondary Text/Assets:** Muted Grey/Silver (`#9CA3AF` or `rgba(255,255,255,0.6)`). Used for sub-headlines, partner logos, and subtle borders.

---

### 3. Typography
* **Font Family:** A clean, modern geometric sans-serif (e.g., Inter, Roobert, SF Pro Display, or Helvetica Neue).
* **Headline (`<h1>`):**
    * Weight: Bold or Semi-Bold.
    * Color: Pure White.
    * Styling: Tight line-height (leading) to keep the multi-line statement cohesive.
* **Sub-headline (`<p>`):**
    * Weight: Regular.
    * Color: Muted Grey.
    * Styling: Slightly looser line-height for readability.
* **Navigation & Buttons:**
    * Weight: Medium.
    * Size: Relatively small (approx 14px-16px) to maintain a refined, non-intrusive look.

---

### 4. Layout Structure (Grid/Flexbox)
The page utilizes a standard horizontal navigation bar over a distinct 2-column hero section.

#### A. Header / Navigation Bar (Top)
* **Layout:** Flexbox, `justify-content: space-between`, `align-items: center`.
* **Left:** Brand Logo ("Bluneo.ai") in white text.
* **Center:** Navigation links ("Home", "Why us", "How it works") spaced evenly.
* **Right:** Primary "Contact" CTA button.

#### B. Hero Section (Middle)
* **Layout:** A two-column split.
* **Left Column (Content - approx 50% width):**
    * Vertically aligned to the center.
    * Elements stacked vertically with consistent spacing (e.g., `gap: 24px`):
        1. **Tag/Badge:** "Intelligent Automation" - Pill-shaped, transparent background, thin grey/white border, small white text.
        2. **Headline:** "Automate the complex. Amplify the human."
        3. **Sub-headline:** "Power workflows that respond, reason, and scale..."
        4. **CTA Button:** "Start building" - Pill-shaped, filled with Primary Accent blue.
* **Right Column (Visual - approx 50% width):**
    * **Top Right Corner:** A large, minimalist white line-art arrow pointing diagonally up and right (↗), symbolizing growth, forward motion, and scale.
    * **Center:** The 3D abstract animation taking up the majority of the spatial volume.

#### C. Footer / Social Proof (Bottom Left)
* **Layout:** Placed horizontally at the bottom of the left column.
* **Content:** "LogoIpsum" placeholder logos.
* **Styling:** Monochromatic grey/low opacity to avoid distracting from the main CTA and 3D graphic.

---

### 5. Animations and Interactions

#### A. The 3D Abstract Graphic (Continuous Loop)
The centerpiece of the design is the 3D rendered looping animation on the right side.
* **Composition:** Consists of two large, flat, circular discs (resembling coins or platforms) and two smaller spheres.
* **Material:** Highly reflective, glossy, metallic blue. It interacts with an invisible light source, creating specular highlights that emphasize its curvature and smooth texture.
* **Motion:** The elements are stacked (Disc > Sphere > Disc > Sphere). They slowly tilt, wobble, and rotate in a continuous balancing act.
* **Psychological Effect:** It visualizes the concept of "Automating the complex" by showing precarious, complex objects being perfectly balanced and stabilized effortlessly.

#### B. Implied Micro-Interactions (Standard UX expectations)
* **Hover States (Buttons):** The blue pill buttons ("Contact", "Start building") should likely feature a slight brightness increase or a subtle scale-up effect (`transform: scale(1.05); transition: 0.2s ease`) on hover.
* **Hover States (Navigation):** The white text links ("Home", etc.) might dim slightly or feature a minimal underline effect on hover.
* **Load Animation:** Elements on the left (Badge, Headline, Subtext, Button) should stagger-fade-in from the bottom (`transform: translateY(20px); opacity: 0`) when the page loads.

---

### 6. Implementation Notes for Future Designs
When building similar designs:
1. **Contrast is Key:** Ensure the background is truly dark to make the blue and white elements "glow".
2. **Negative Space:** Do not clutter the layout. The generous padding and margins (especially around the text block on the left) allow the 3D element to breathe.
3. **Asset Generation:** The 3D element can be created using tools like Spline (spline.design) or Three.js to embed interactive, real-time 3D models directly into web frameworks seamlessly without the heavy load of a video file.
4. **Shapes:** Maintain consistency in shapes. The buttons, the badge, and the 3D elements all utilize heavy border-radii (pill shapes and circles/spheres), softening the starkness of the dark background.

## BotNest Landing Page: Design, Animations, and Interactions Analysis

This document provides a comprehensive breakdown of the design system, animations, and interactive elements observed in the BotNest landing page video. It is intended to serve as inspiration for future designs, particularly when building components in tools like Google Stitch.

### 1. Global Aesthetic & Thematic Overview
* **Theme:** "Elegant Tech" – The design merges organic, moody natural environments (mountainscapes, forests) with hyper-modern, sleek UI dashboards. This creates a juxtaposition between calm reliability and advanced technology.
* **Color Palette:**
    * **Backgrounds:** Deep charcoal, near-black, and muted dark grays.
    * **Typography:** Off-white, soft grays for secondary text to reduce eye strain.
    * **Accents:** Vibrant, blurred gradient glows (neon orange, glowing green, soft blue) used sparingly behind UI elements to create depth and focus.
* **Typography:**
    * **Headlines:** A sophisticated, high-contrast Serif font (gives an enterprise, trustworthy, and editorial feel).
    * **Body & UI Text:** A clean, geometric Sans-Serif font (ensures readability in dense data dashboards).
* **UI Style:** Dark mode Glassmorphism. Cards feature semi-transparent backgrounds with thin, subtle borders and background blurs.

---

### 2. Section-by-Section Breakdown

#### A. Hero Section (0:00 - 0:06)
* **Layout:** Centered navigation bar. A prominent, centered headline and sub-headline. A primary CTA button ("Talk to us"). Three overlapping, floating UI cards ("Voice Agent", "Messaging Agent", "Email Agent") arranged in an arc or staggered layout below the text.
* **Background:** A misty, monochromatic mountain range that acts as a subdued backdrop.
* **Animations & Interactions:**
    * **Entry:** Elements fade in with a soft, upward translation.
    * **Parallax:** As the user scrolls, the floating UI cards move at different speeds relative to the background, creating a 3D depth effect.
    * **Card Hover/State:** The cards possess a glass-like transparency that slightly distorts the mountain background behind them.

#### B. Client Success & Social Proof (0:07 - 0:14)
* **Layout:** Section header followed by a grid/row of client logos (Riot Games, Asos, Eventbrite, etc.). Below the logos, a split layout featuring a quote/testimonial on the left and a large metric card on the right.
* **Animations & Interactions:**
    * **Logo Reveal:** Logos fade in sequentially or scroll infinitely (Marquee effect).
    * **Number Counter (Odometer):** The metric card ("1M Revenue generated") features a dynamic number counter that quickly counts up to the final value as it enters the viewport.
    * **Glow Effects:** A soft, ambient glow highlights the active metric card.

#### C. Experiences / Core Features (0:15 - 0:28)
* **Layout:** Left-aligned sticky text (Headline + Subtext) with scrolling right-side visual assets. The assets are high-fidelity mockups of the product interface (chat modules, configuration panels).
* **Design Details:** The UI cards showcase "Finance AI Agent" configurations, utilizing a glowing green accent color to signify active states or successful configurations.
* **Animations & Interactions:**
    * **Typing Effect:** Chat bubbles animate in sequentially, and text appears with a typing effect to simulate a live AI conversation.
    * **Staggered Fade-ins:** Dashboard components (like the ETA tracker or revenue metrics) pop in with a staggered delay.

#### D. Testing Playbook (0:29 - 0:36)
* **Layout:** Features code snippets floating alongside a "Test Results" dashboard.
* **Design Details:** Uses a dark IDE-style theme for the code snippets. The test dashboard features clear pass/fail metrics.
* **Animations & Interactions:**
    * **Code Typing:** The React/JavaScript code animates as if being typed out in real-time.
    * **Dynamic Updating:** The "Test Results" dials are highly active. The "Pass rate" dynamically counts up from 58% to 95%, while the "Passed" and "Failed" numbers update simultaneously.

#### E. Analytics & Optimization (0:37 - 0:46)
* **Layout:** A massive analytics dashboard taking center stage, overlaying a dark, moody forest background.
* **Design Details:** Features line charts, containment rate metrics, and API tool call statistics. The charts use a striking neon blue/cyan line against the dark background.
* **Animations & Interactions:**
    * **Chart Drawing:** The line graph dynamically draws itself from left to right.
    * **Data Fluctuation:** The metrics rapidly tick up (e.g., Containment Rate flying from 6% to 93%, Handling Time dropping). This kinetic movement makes the data feel alive and real-time.

#### F. Lightning Deployment Timeline (0:47 - 0:51)
* **Layout:** A horizontal timeline representing Day 1, Day 7, and Day 14.
* **Animations & Interactions:**
    * **Progress Bar Fill:** A glowing orange progress line horizontally fills across the screen, connecting the nodes.
    * **Node Activation:** As the line hits each day (node), the corresponding text below it fades in.
    * **Stat Counters:** Three circular metric indicators at the bottom count up from low percentages to 100% concurrently with the progress bar.

#### G. Footer & Final CTA (0:52 - 0:56)
* **Layout:** A bold, centered final call to action ("Excited to watch..."). Below is a structured, multi-column footer with standard links, copyright, and location details.
* **Design Details:** The bottom edge of the footer features a beautiful, warm, multi-colored blurred gradient (orange, brown, teal) that anchors the page and provides a warm finish to the dark aesthetic.

## ConnectedWallet Landing Page Design Specification

### 1. Overall Theme & Aesthetic
- **Style:** Futuristic, Web3 / Crypto-inspired, Dark Mode, Minimalist Typography with high-fidelity 3D visuals.
- **Mood:** Bold, innovative, premium, and mysterious.
- **Color Palette:** - **Background:** Deep Black (`#000000`) to create maximum contrast and depth.
  - **Typography:** Pure White (`#FFFFFF`) for primary headings and buttons; Soft Grey (e.g., `#A0A0A0`) for body copy to establish visual hierarchy.
  - **Accents (via 3D Asset):** Ethereal neon purple, starlight blue, and a striking fiery orange/magma gradient.

### 2. Layout Structure
The design utilizes a classic asymmetrical split-screen layout for the hero section, balancing heavy visual weight on the left with clean, structured typography on the right.

#### A. Global Navigation (Header)
- **Top Left:** - **Brand Logo:** A minimalist, geometric icon (stylized 'X' or symmetrical abstract shape).
  - **Search Bar:** A subtle, dark pill-shaped search input labeled "Search new" with a magnifying glass icon. It blends seamlessly into the dark background.
- **Top Center/Left:** Horizontal navigation links ("Home", "Trading") using a clean sans-serif font.
- **Top Right:** A prominent primary action button labeled **"Connect wallet"**. It features a solid white background with black text, encapsulated in a rounded pill shape.
- **Sub-Navigation (Right aligned, below header):** A small, vertically stacked list of secondary links ("About", "Mint") positioned above the main headline, acting as a breadcrumb or section indicator.

#### B. Hero Section
- **Left Column (Visual Focus):** - Contains a massive, floating 3D crystalline monolith.
  - The object takes up roughly 50-60% of the viewport width.
- **Right Column (Content Focus):** - Vertically centered within its column.
  - **Headline (H1):** "Create the Future – Don't Just Watch It". Large, bold, sans-serif typography with tight line-height, rendered in pure white.
  - **Body Copy (p):** "We're looking for bold thinkers and creators ready to reshape the future of digital ownership. Explore roles in marketing, tech, and creative innovation." Written in a readable, smaller grey font, providing context without distracting from the headline.
  - **Call to Action (CTA):** "Discover open role". Matches the "Connect wallet" button styling (white pill, black text).

### 3. Animations & Interactions

#### 3D Asset (The Crystal Monolith)
- **Ambient Animation:** The massive 3D crystal is not static. It features internal particle simulations resembling a trapped galaxy or nebula (purple/blue stardust) and a molten, glowing core at the bottom tip (orange/yellow).
- **Lighting Dynamics:** The surface of the crystal catches light dynamically, suggesting a slow, continuous rotation or a shimmering lighting environment reflecting off its geometric facets.
- **Implementation Suggestion:** This can be achieved using WebGL (Three.js, React Three Fiber) or interactive 3D design tools like Spline.

#### UI Interactions (Recommended for Google Stitch / Frontend)
- **Hover States:**
  - **Navigation Links ("Home", "Trading", "About", "Mint"):** Subtle opacity change (e.g., from 70% to 100% white) on hover.
  - **Pill Buttons ("Connect wallet", "Discover open role"):** A slight scale-up effect (`transform: scale(1.05)`) and perhaps a subtle glow or box-shadow on hover to indicate clickability.
- **Entry Animations:** - The 3D element should seamlessly fade in or float up upon page load.
  - The typography on the right should stagger-fade in (Headline first, followed by body text, then CTA button) to guide the user's eye.

## Glide - Landing Page Design & Interaction Specification

### 1. Global Visual Language & Theme
* **Theme**: Deep Dark Mode, Futuristic Web3 / Cyberpunk aesthetic.
* **Color Palette**:
    * **Background**: Deep black (`#000000`) to very dark charcoal gradients.
    * **Primary Accent**: Neon/Glowing Red (`#FF0033` to `#FF3333`) and deep Crimson.
    * **Secondary Accent**: Electric Purple/Magenta (used in 3D glowing elements).
    * **Text Primary**: Pure White (`#FFFFFF`) for main headings.
    * **Text Secondary**: Light Grey (`#A0A0A0`) for body copy and subtitles.
    * **Borders/Lines**: Very subtle, low-opacity red or grey for card outlines.
* **Typography**: Clean, geometric Sans-Serif font (similar to Inter, Space Grotesk, or Roobert). Large, bold tracking for headings; legible, readable tracking for body.
* **Imagery**: 3D geometric shapes (cubes, spheres, abstract architectural blocks) rendered with high contrast, subsurface scattering, and strong internal light sources (glowing neon). 

---

### 2. Global Animations & Interactions
* **Scroll-Driven Parallax**: Elements move at slightly different speeds as the user scrolls, creating a sense of depth (especially the 3D backgrounds and floating cards).
* **Text Decoding/Scrambling Effect**: A signature transition used for major headings. Text appears as randomized gibberish/symbols and rapidly cycles/decodes into the readable English text as it scrolls into view (seen at 0:03, 0:08, and 0:15).
* **Fade & Slide Up**: Standard entrance animation for cards, text blocks, and footer elements. They fade from 0% to 100% opacity while translating upwards by ~20-40px.
* **Continuous Ambient Animation**: The 3D elements in the background (like the sphere inside the cube) likely have a slow, continuous rotation or pulsing glow effect.

---

### 3. Component Breakdown

#### 3.1. Navigation Bar (Sticky/Floating)
* **Layout**: Top-center, pill-shaped floating container.
* **Background**: Semi-transparent dark grey with a heavy background blur (glassmorphism effect) and a very faint, thin border.
* **Elements**:
    * **Left**: Brand Logo (Red geometric mark) + Text ("Glide").
    * **Center**: Links (Build, Explore, Ecosystem, About, Socials). Text is small, grey, turning white on hover.
    * **Right**: "Connect" button (White background, black text, pill-shaped).

#### 3.2. Buttons
* **Primary (e.g., "Start Building", "Learn More", "Get Started")**:
    * Vibrant red background, white text.
    * Rounded corners (border-radius: ~12px to 16px).
    * Interaction: Slight scale-up and glow expansion on hover.
* **Secondary (e.g., "Read docs")**:
    * Dark grey background (almost blending with the page), white text.
    * Slightly lighter grey border.

---

### 4. Section-by-Section Details

#### Section 1: Hero (0:00 - 0:01)
* **Background**: Immersive 3D grid of dark cubes. In the center, a glowing magenta/red sphere is encased in a transparent, refractive glass cube.
* **Layout**: Asymmetrical bottom-heavy. 
    * Left: Massive text "Built for Builders".
    * Right: Descriptive body text ("Experience blazing-fast transactions...") stacked above the Primary and Secondary buttons.
* **Scroll Transition**: As the user scrolls down, the hero text aggressively fades and slides up, and the background darkens significantly to focus on the next section.

#### Section 2: Intro & Value Prop (0:02 - 0:04)
* **Content**: "Glide helps developers automate blockchain security..." followed by the decoded text "Built to help Developers build faster with less complexity".
* **Animation**: The text utilizes the signature "matrix-style" scrambling decode effect.
* **Call to Action**: A centered "Learn More" red button fades in below the heading.

#### Section 3: Feature Grid (0:04 - 0:08)
* **Layout**: Masonry or staggered grid layout of rectangular cards.
* **Card Design**: 
    * Deep black interior.
    * Gradients or glowing red outlines/borders.
    * Each card features a unique 3D glowing red/orange asset (e.g., glowing circuitry, abstract shielding, nodes).
* **Cards Shown**:
    1. Seamless Access
    2. Implementation Process
    3. AI Transaction Guardian
    4. Selective Privacy
    5. Contract Shield
    6. Smart Gas Wizard
* **Interaction**: Cards slide up sequentially as the user scrolls. The cards likely have a hover tilt (3D transform) or a hover glow effect.

#### Section 4: Data Availability (DA) Security (0:09 - 0:10)
* **Heading**: "Ethereum DA Security" decodes into place.
* **Centerpiece**: A large, detailed 3D structure—a glowing sphere surrounded by metallic ring segments encased in a glass cube.
* **Surrounding Stats**: Four data points float around the centerpiece (cross-hair layout):
    * Top Left: TPS (600+ on ETH DA)
    * Top Right: Blocktime (1 second)
    * Bottom Left: Fees ($0.0002 cents)
    * Bottom Right: DA Security (Ethereum 4844)
* **Bottom Ticker**: A horizontally scrolling marquee text bar: "Glide -> parallel -> state minimized -> native account abstraction -> native assets".

#### Section 5: Infrastructure Breakthroughs (0:11 - 0:12)
* **Layout**: 3-column horizontal grid.
* **Cards**: Tall, portrait-oriented cards.
    * "Hybrid Consensus"
    * "Hot-swappable MLOps"
    * "AI Model Marketplace"
* **Visuals**: Each card contains a glowing red 3D item intersecting with a glass-like rectangular slab.

#### Section 6: Use Cases (0:13 - 0:14)
* **Heading**: "What you can Build?"
* **Layout**: 50/50 split. 
    * Left: A glowing, red, 3D abstract character/structure (resembling a stylized space invader or game boss).
    * Right: Text targeting specific verticals. "Gaming: Level Up Your Gaming Experience", descriptive text, and a "Read More" button.

#### Section 7: Final CTA & Footer (0:15 - 0:17)
* **CTA Heading**: "Get Started with Glide today in just 10 seconds" (uses the scrambling decode animation).
* **CTA Button**: Centered "Get Started" red button.
* **Footer Layout**:
    * **Left Column**: Brand logo, short blurb, and a distinct "Join our Telegram" button (red with a paper plane icon).
    * **Right Columns**: Standard footer links (Product, Company, Resources).
    * **Bottom Bar**: Copyright line on the left, social media icons (Twitter, Discord, Medium) aligned to the right. Muted grey text.

## Lumina Login Screen - Design & Interaction Specification

### 1. Overview
The Lumina login screen utilizes a modern, split-pane layout (50/50 split). The left pane contains the interactive authentication form, while the right pane features a playful, animated 2D vector illustration of an axolotl-like character in a vibrant landscape. The overall aesthetic is friendly, approachable, and clean, heavily utilizing soft rounded corners, ample whitespace, and a fresh green color palette.

### 2. Layout & Structure
* **Container:** A centralized, elevated card with large border-radius (approx. 24px - 32px) floating on a subtle, muted green/grey background.
* **Left Pane (Form):** Vertically centered flexbox column. Left-aligned content with a standard max-width to ensure readability and comfortable input lengths.
* **Right Pane (Illustration):** Full-bleed within its half of the container. The illustration is clipped to the container's rounded corners on the top-right and bottom-right.

### 3. Visual Language

#### Colors
* **Primary Brand Color (Green):** Approx. `#82C94A` to `#9CCC65` (used for the primary button, checkbox, 'Sign up' link, and logo accent).
* **Text (Primary):** Dark Grey/Charcoal (e.g., `#2D3142`) for headings and main text.
* **Text (Secondary/Placeholders):** Light Grey (e.g., `#9094A6`) for subheadings, input placeholders, and inactive links.
* **Surface (Form):** Pure White `#FFFFFF`.
* **Input Backgrounds:** Very light grey `#F4F5F7` with subtle borders.
* **Illustration Palette:** Soft gradients of sky blue, vibrant meadow greens, yellow pathways, and deep blue/purple mountains.

#### Typography
* **Typeface:** Modern Sans-Serif (e.g., Poppins, Inter, or Roboto).
* **Heading:** H1/H2, Bold, Dark Grey.
* **Subheading:** Regular weight, Light Grey, smaller font size (approx. 14px).
* **Form Labels/Placeholders:** Regular weight, 14px.
* **Button Text:** Medium to Semi-Bold, 16px.

### 4. Components

#### Input Fields
* **Style:** Filled background (light grey), no heavy strokes unless focused. Highly rounded corners (approx. 12px).
* **Email Field:** Standard text input.
* **Password Field:** Includes a right-aligned, text-based "Show" toggle button.

#### Buttons
* **Primary Button ("Log In ->"):** Full width of the form column. Filled with Primary Green. Contains a right-pointing arrow icon to imply forward momentum. Hover state: slight shadow elevation and brightness increase.
* **Secondary Button ("Continue with Google"):** Full width. Outlined or subtle drop shadow with a white background. Includes the Google 'G' logo on the left.

#### Other Elements
* **Checkbox ("Remember me"):** Custom styled. When checked, it features a solid green background with a white checkmark.
* **Divider:** A horizontal line with "or" text in the center, visually separating native login from SSO (Google).

### 5. Animation & Interactions

#### The Mascot (Right Pane)
The character (axolotl/lizard) acts as an interactive companion to the login process.
* **Idle State:** * *Breathing:* Subtle vertical scaling/translation to simulate breathing.
    * *Blinking:* Random interval eye blinks.
    * *Environment:* Clouds slowly drifting horizontally in the background sky.
* **Focus State (Email/Text):**
    * When the user clicks the email field, the character's head and eyes track the cursor or "look" toward the left side of the screen where the typing is occurring.
* **Privacy State (Password):**
    * When the user focuses on the password field, the character covers its eyes with its paws (a common and delightful micro-interaction pattern for mascots on login screens).
    * If the user clicks "Show" on the password, the character peeks through its fingers or uncovers its eyes.
* **Success State (Log In Click):**
    * Upon successful login, the character smiles wider or does a small celebratory bounce before the screen transitions.

#### Form Micro-interactions
* **Input Focus:** The border of the active input field highlights with the Primary Brand Green.
* **Hover States:** Buttons smoothly transition background colors or lift slightly (box-shadow). Links ("Forgot password?", "Sign up") change color or gain underlines.

## Design Specification: Smart Banking Landing Page

This document breaks down the visual design, layout, animations, and interactive elements of the provided landing page design. It serves as a blueprint for implementing similar modern, high-contrast fintech interfaces.

### 1. Overview and Art Direction
The design employs a **split-screen horizontal layout** (light top, dark bottom) combined with a **glassmorphism/floating layered aesthetic**. The style is highly modern, vibrant, and tailored for a fintech or crypto-banking product. 

**Key Design Traits:**
* Mesh gradients & vibrant color palettes.
* Z-axis depth using overlapping floating UI cards and soft, expansive drop shadows.
* High contrast typography (Black text on light backgrounds, white text on dark backgrounds).
* Integration of 2D vector doodles and 3D objects (the yellow sphere).

---

### 2. Color Palette

#### Backgrounds
* **Hero Gradient:** A soft, multi-stop mesh gradient blending warm and cool tones. 
    * *Top-Left:* Soft Peach / Orange (approx. `#FFAF96`)
    * *Bottom-Right:* Pale Mint / Cyan (approx. `#BCE6D8`)
* **Footer/Stats Base:** Solid Black (`#000000`) or very dark charcoal (`#0A0A0A`).

#### UI Elements
* **Assets Card:** Vibrant Cyan/Blue (approx. `#0EA5E9`).
* **Visa Card:** Intense warm-to-cool mesh gradient (Orange `#FF6B6B` $\rightarrow$ Magenta `#D81B60` $\rightarrow$ Purple `#8E24AA`).
* **Chart UI (Mobile App):** Dark surface (`#1A1A1A`) with a neon purple chart fill (gradient fading to transparent at the bottom).
* **Accent 3D Element:** Yellow/Gold (`#FACC15`).

---

### 3. Typography
* **Typeface:** A geometric sans-serif (e.g., *Inter, Poppins, or Satoshi*).
* **Hero Headline:** Extremely large, bold (e.g., 800 weight), tight line-height (approx. 1.1), tracking slightly negative. Color: `#000000`.
* **Body Copy:** Medium or Regular weight, highly legible. Color: `#4A4A4A` on light, `#A3A3A3` on dark.
* **Stats Numbers (e.g., "8X", "+100"):** Bold, large (approx. 48px-64px), stark white (`#FFFFFF`).
* **Navigation:** Medium weight, approx. 15px-16px, solid black.

---

### 4. Component Breakdown & Layout

#### A. Top Navigation
* **Logo:** Simple geometric mark (left aligned).
* **Links:** Centered, spaced evenly (Trade, Planning, News, Products [with dropdown caret], Company).
* **Actions:** Right-aligned "Log In / Sign Up" with a slash separator.

#### B. Hero Section (Left Column)
* **Headline:** "Smart Banking To Manage Your Transactions" with a hand-drawn purple squiggle accent next to the word "Transactions".
* **CTA Block:** A horizontal flex layout. 
    * Left: A solid black button "Get The Card $\rightarrow$" with white text. 
    * Right: A small block of explanatory text acting as secondary context.

#### C. Floating UI Presentation (Right Column)
This area utilizes absolute positioning to overlap three distinct elements, creating depth.
1.  **The Assets Card (Back-right):** Blue background with a frosted glass feel. Contains rows for Bitcoin, Ethereum, Shiba, and Tether with custom progress bars (styled with gradients matching the asset colors).
2.  **The Mobile App View (Bottom-right):** A dark mode UI showing a wallet balance, quick action buttons, and a smooth spline area chart. Bleeds down into the black footer section.
3.  **The Visa Card (Front-center):** Floating above the split line between the light and dark backgrounds. Contains an EMV chip, contactless icon, user avatar, name, and expiration date.

#### D. Footer Stats Area (Bottom)
* **Metrics:** Two columns showing key benefits ("8X Rapid increase...", "+100 Decrease your expenses...").
* **App Stores:** Standard "Download on the App Store" and "Get it on Google Play" badges in a horizontal row.

---

### 5. Suggested Animations & Interactions

To bring this static design to life, the following interactions and CSS/JS animations are recommended:

#### On-Load Animations
* **Hero Text:** Staggered slide-up fade. The headline, CTA, and subtext fade in from `translateY(20px)` over 600ms, staggering by 100ms.
* **Floating Cards:** * The Assets card slides in from the top right.
    * The Mobile app UI slides up from the bottom.
    * The Visa card scales up (`scale(0.8)` to `scale(1)`) and fades in last to establish it as the front-most layer.
* **3D Sphere:** Drops in and bounces softly into place.

#### Continuous Idle Animations
* **Levitation:** The Visa card, Assets card, and yellow sphere should have a subtle, infinite floating animation (`translateY(-10px)` to `translateY(10px)` over 4-6 seconds with `ease-in-out`). Offset the animation delays so they float independently.
* **Squiggle Doodle:** Apply a subtle dash-array drawing animation or a slow rotation to the purple squiggle.

#### Interactive/Hover States
* **Navigation Links:** Underline expand from center or color fade to a darker gray on hover.
* **"Get The Card" Button:** * Hover: The arrow translates right by `4px`. The black background shifts slightly to dark gray (`#222`), or a subtle shadow expands.
* **Assets List Rows:** On hover, the specific row (e.g., Bitcoin) gets a slight white translucent background (`rgba(255,255,255,0.1)`) and scales to `1.02`.
* **Visa Card:** Mouse-move parallax effect (3D tilt). As the user moves the cursor over the right side of the screen, the card rotates slightly on the X and Y axes (e.g., `rotateX(10deg) rotateY(-10deg)`) to enhance the 3D feel.
* **"View All" Button (on Assets Card):** Black button shifts to `#1A1A1A` on hover, white text glows slightly.

#### Scroll Interactions (Parallax)
* As the user scrolls down the page, the frontmost elements (Visa Card) should scroll up faster than the background elements (Assets Card), enhancing the depth of field.

## Design Specification: "Nature-Immersive SaaS Landing Page"

This document outlines the design structure, visual style, animations, and interactions of the provided landing page inspiration. It serves as a blueprint for implementing a similar highly polished, layered aesthetic.

### 1. Overall Aesthetic & Vibe
* **Theme:** Modern SaaS meets serene nature. The design breaks away from traditional tech grids by embedding the product UI directly into a photorealistic, 3D landscape.
* **Style:** Minimalist, high-depth, premium, and calm.
* **Key Feature:** Spatial layering. The product dashboard is sandwiched between a background mountain/sky layer and a foreground rolling hills layer, creating a profound sense of depth.

### 2. Color Palette
The color palette relies on natural gradients contrasted with stark monochrome UI elements.
* **Background (Sky/Distant Mountains):** Soft, hazy gradient transitioning from pale sky blue (`#E2EDF8` approx.) at the top to a warm, sunlit cream/off-white (`#FDFBF7` approx.) near the horizon.
* **Foreground (Hills):** Vibrant, lush grass green transitioning into deep, shadow greens in the valleys (`#689F18` to `#1D3305`).
* **Typography (Primary):** Near-black / Dark Charcoal (`#111111`) for maximum contrast against the soft sky.
* **Buttons:** Standard Black (`#000000`) and White (`#FFFFFF`) with subtle box-shadows.
* **UI Dashboard Accents:** Clean white background (`#FFFFFF`), dark gray metric cards (`#1E1E1E`), and vibrant neon green accents for "Active" states and positive charts (`#00FF66`).

### 3. Typography
The design uses a sophisticated mix of three distinct typeface styles to establish visual hierarchy:
* **Logo (`redacted`):** A bold, slightly brutalist or retro sans-serif. 
* **Primary Headline (Hero):** An elegant, high-contrast Serif font (e.g., *Playfair Display*, *GT Super*, or *Ogg*). This gives the tech product an editorial, premium feel.
* **Sub-headline:** A classic Monospace or typewriter font (e.g., *Space Mono*, *Courier*, or *SF Mono*). This contrasts beautifully with the serif and hints at the technical/developer nature of the tool.
* **Navigation & Buttons:** A clean, geometric Sans-Serif (e.g., *Inter*, *Circular*, or *Roobert*), heavily tracked (letter-spaced) in smaller sizes.

### 4. Layout Structure

#### A. Global Header (Sticky or Fixed)
* **Left:** Brand Logo (text-based).
* **Center:** Navigation links (`Features`, `Pricing`, `Docs`, `Changelogs`, `Status`). Set in small, bold sans-serif.
* **Right:** Small, pill-shaped primary CTA button (`Get started`).

#### B. Hero Section
* **Headline:** "The tool to understand your users before they churn." Centered, large, breaking onto two lines.
* **Subtext:** Centered, constrained width (max 600px), monospaced text.
* **Action Row:** Two pill-shaped buttons placed side-by-side. 
    * Primary: Black background, white text ("Start for free ->").
    * Secondary: White background, black text ("Talk to us").

#### C. Product Showcase (The "Sandwich" Layout)
* **The Dashboard:** A floating, rounded-corner UI mockup representing the application. It features a sidebar and a main data view with dark-themed metric cards.
* **Z-Index Layering:**
    * **Layer 1 (Back):** Sky and distant faded mountains.
    * **Layer 2 (Middle):** The UI Dashboard.
    * **Layer 3 (Front):** The high-contrast, lush green rolling hills. The hills physically overlap the bottom half of the dashboard, making it look planted in the environment.

#### D. Social Proof
* **Location:** Integrated directly *onto* the dark green slope of the foreground hills.
* **Text:** "Used by managers from" (small, white/light gray).
* **Logos:** Vimeo, Uber, Stripe, Google, Revolut. All logos are single-color (white), horizontally aligned.

---

### 5. Animations & Interactions

To bring this static design to life, the following animations and interactions should be implemented:

#### A. Initial Load (Entrance Animations)
* **Background:** The sky and hills fade in smoothly (1.5s ease-in-out).
* **Typography:** The headline uses a subtle "reveal" or "slide up" animation per word or line, common in modern Awwwards-style sites. The monospace sub-headline types out or fades in shortly after.
* **Dashboard Entrance:** The UI dashboard slides up from *behind* the foreground hills, settling into its floating position (easing: `cubic-bezier(0.16, 1, 0.3, 1)`).

#### B. Hover Interactions
* **Navigation Links:** Underline expand on hover, or a slight reduction in opacity for non-hovered items.
* **Buttons:** * The "Start for free" button slightly scales up (1.05x) and the arrow (`->`) translates horizontally to the right by 2-4px.
    * The "Get started" button gains a subtle, larger drop-shadow on hover.
* **Dashboard Elements:** If interactive, hovering over the dark metric cards inside the mockup could trigger a slight scale or brightness bump.
* **Partner Logos:** Logos are slightly translucent (70%) by default and become 100% opaque on hover.

#### C. Scroll Interactions (Parallax)
Because of the strong depth-of-field, parallax scrolling is essential:
* **Foreground Hills:** Move upwards fastest when the user scrolls down.
* **UI Dashboard:** Moves upwards at a medium speed, eventually being hidden by the foreground hills or transitioning out.
* **Background Sky/Mountains:** Moves upwards very slowly, or stays completely fixed (`background-attachment: fixed`).
* **Floating Effect:** Independent of scrolling, the dashboard should have a continuous, gentle vertical oscillation (e.g., translating up and down by 10px over a 4-second continuous loop) to feel like it is hovering in space.

## Playverse Landing Page - Detailed Design Specification

### 1. Overview
The design is a high-contrast, dark-themed landing page tailored for a Web3/Crypto gaming project ("PLAYVERSE"). It leverages a cinematic, cyberpunk/sci-fi aesthetic with deep blacks and vibrant neon-orange fire accents. Key UI trends include dark mode glassmorphism, glowing effects, and a highly structured, data-rich interactive widget.

### 2. Global Styling & Theming

#### 2.1. Color Palette
* **Background (Main):** `#0E0E0E` (Deep Space / Charcoal) blending into pitch black.
* **Primary Accent:** `#FF5500` (Neon Orange/Fire) - Used for glows, primary buttons, and highlight text.
* **Secondary Accent (Gradients):** `#FF8C00` (Dark Orange/Amber) - Used alongside the primary accent for button gradients.
* **Surface / Widget Background:** `rgba(255, 255, 255, 0.03)` with a subtle inner shadow and background blur (Glassmorphism).
* **Widget Borders:** `1px solid rgba(255, 255, 255, 0.08)` (Very faint white/gray border to define edges).
* **Text (Primary):** `#FFFFFF` (Pure White) - Used for main headings, active numbers, and CTA text.
* **Text (Secondary):** `#9E9E9E` (Muted Gray) - Used for labels, subheadings, and passive data.

#### 2.2. Typography
* **Display Font (Logo & Main Heading):** A wide, stylized, futuristic sans-serif (e.g., *Orbitron*, *Syncopate*, or a custom SVG). Characterized by sharp angles and extended widths.
* **Body/UI Font:** A clean, highly legible geometric sans-serif (e.g., *Inter*, *Satoshi*, or *Outfit*). Font weights vary from Regular (400) for labels to Bold (700) for data points.

### 3. Layout & Components Breakdown

#### 3.1. Header / Navigation
* **Positioning:** Fixed or sticky at the top, transparent background.
* **Left:** "PV" Logo (White, geometric).
* **Right Controls:**
    * **Connect Wallet Button:** Pill-shaped (`border-radius: 999px`), transparent background, `1px solid rgba(255, 255, 255, 0.3)`. Contains a small wallet icon.
    * **Menu Button:** Pill-shaped, matching border, contains "Menu" text and a 3-line hamburger icon.

#### 3.2. Left Column: Hero Content & Token Sale Widget
* **Headings:**
    * `H1`: "PLAYVERSE" (Display font, White, Uppercase).
    * `H2`: "Token on Binance Smart Chain" (UI Font, White, Bold).
    * `Subtitle`: "where gaming meets the power of blockchain" (UI Font, Gray, Lowercase).
* **Token Sale Widget (The Core Interactive Component):**
    * **Style:** Glassmorphic card, rounded corners (`border-radius: 16px`), dark translucent background with backdrop blur.
    * **Promo Banner:** Top row with "Use promo PGMLaunch to get 15% Bonus" (Promo code and percentage in Orange). Features a close `X` and a share/send icon.
    * **Stage Indicator Box:** Inner dark box highlighting the current stage ("Stage 4" with a checkmark) and "Total Raised: $2,094,890.00".
    * **Progress Bar:** Large, thick track.
        * *Track:* Dark gray `rgba(255, 255, 255, 0.1)`.
        * *Fill:* Light gray/white fill showing `98.64%`.
        * *Text:* Inside the bar, left aligned percentage, right aligned remaining tokens.
    * **Stats Grid:** 3 columns displaying "Current price in USDT", "Tokens Sold", and "Next stage" price.
    * **Payment Icons:** Small row of supported payment methods (e.g., Crypto icons, Visa).
    * **CTA Button Group:**
        * *Primary Action:* "Buy O2T Tokens" (Full width, dark grey background with a subtle brownish/orange tint and border).
        * *Secondary Actions (Split 50/50):* "How To Buy?" (Solid Neon Orange) and "Win $888k" (Neon Orange to Amber gradient). Both use pill-shaped borders.

#### 3.3. Right Column / Background: Hero Visual
* **Imagery:** A hyper-realistic, dark and moody render of a hooded figure.
* **Key Visual Effect:** A glowing, fiery neon-orange light emanates from the figure's eyes/visor area, casting volumetric lighting onto the face and hood.
* **Integration:** The image fades out seamlessly into the dark background on the left and bottom edges using gradient masks.

#### 3.4. Floating UI Elements
* **Pagination Dots (Right Edge):** Three vertically stacked dots indicating slider/page position. The active dot is filled white; inactive dots are outlined gray.
* **Scroll Indicator (Bottom Center):** A circular, badge-like element. Text "SCROLL TO EXPLORE" wraps in a circle around a central downward arrow.
* **Social Links (Bottom Right):** Minimalist, monochromatic icons for Instagram, X (Twitter), and Telegram.

---

### 4. Animations & Interactions

To bring this static design to life, the following animations (CSS/JS) should be implemented:

#### 4.1. Load Sequence (Entrance Animations)
* **Background Visual:** Fades in slowly (2000ms `ease-in-out`). The orange neon visor light pulses once brightly before settling into a continuous ambient glow.
* **Left Content:** Staggered slide-up and fade-in (TranslateY from 20px to 0px, opacity 0 to 1).
    * 0ms: Main Headings
    * 200ms: Token Sale Widget container
    * 400ms: Widget internal elements (Progress bar fills from 0 to 98.64% over 1.5 seconds using an `ease-out` timing function).
* **Header & Floating UI:** Fade in from top/sides after main content resolves.

#### 4.2. Continuous/Ambient Animations
* **Visor Glow:** The orange light on the character's face should have a subtle, continuous CSS `@keyframes` pulse (opacity fluctuating between 0.8 and 1.0, and `box-shadow` blur radius expanding and contracting slightly).
* **Scroll Badge:** The circular text "SCROLL TO EXPLORE" should rotate continuously on its center axis (360 degrees over 15 seconds, linear). The center arrow can have a subtle vertical bounce (TranslateY 0px to 3px).

#### 4.3. Hover States & Micro-interactions
* **Header Buttons (Connect Wallet / Menu):** On hover, background transitions from transparent to `rgba(255, 255, 255, 0.1)`. Cursor changes to pointer.
* **Token Sale Widget - Buy Buttons:**
    * "Buy O2T Tokens": Border brightens, background tint shifts slightly warmer.
    * "How To Buy?" & "Win $888k": Slight scale up (`transform: scale(1.02)`), and the box-shadow/glow effect intensifies to emphasize clickability.
* **Social Icons:** On hover, opacity shifts from 0.6 to 1.0, and they slide up slightly by 2px.

### 5. Technical Considerations for Implementation
* **Responsiveness:** On mobile, the layout must stack. The hero image should either become a background watermark with high opacity overlay or sit below the main widget. The widget should span 100% of the mobile viewport width minus padding.
* **Asset Formats:** Use WebP or AVIF for the hero background to maintain the high fidelity of the dark gradients without banding, while keeping file sizes low. The glow effects should ideally be a mix of the baked-in image and CSS radial gradients (`radial-gradient(circle, rgba(255,85,0,0.4) 0%, rgba(0,0,0,0) 70%)`) positioned over the visor to allow dynamic pulsing.

## UntoldArch - Landing Page Design Specification

### 1. Overview
This document outlines the design, animation, and interaction specifications for the "UntoldArch" landing page. The design features a modern, warm, and highly editorial aesthetic, blending brutalist typography with organic shapes and warm gradients. 

### 2. Global Styles

#### 2.1. Color Palette
* **Background Gradient:** A soft, warm gradient transitioning from a creamy off-white/beige (`#FDF8F5`) to a warm terracotta/peach (`#E8A988`) radiating from the center right.
* **Primary Text & Dark Accents:** Deep Charcoal / Black (`#111111`) - used for massive headlines, dark cards, and the main header button.
* **Accent Color:** Muted Orange/Terracotta (`#D28652`) - used for secondary buttons ("View All Projects") and graphic linework.
* **Card Backgrounds (Dark):** `#161616` - used for the project details cards and the award card.
* **White:** `#FFFFFF` - used for the graphic circle background and small interactive buttons within dark cards.

#### 2.2. Typography
* **Primary Display Font (Headline):** A highly legible, bold, sans-serif font (e.g., *Helvetica Now Display* or *Inter* tightly kerned) for the "unt ld" text and "WE BLEND ART & SCIENCE...".
* **Secondary Display Font (Script):** A decorative, elegant script/serif font (e.g., *Cormorant Garamond* or a custom display serif) used for the word "Architecture" sitting beneath the main title.
* **Body & UI Font:** A clean, neutral sans-serif (e.g., *Satoshi* or *Roobert*) for navigation links, paragraph text, and small labels (caps).

#### 2.3. Base Elements
* **Buttons (Primary - Dark):** Black background, white text, pill-shaped (`border-radius: 40px`), uppercase, tracked out letter-spacing.
* **Buttons (Secondary - Accent):** Terracotta background, white text, pill-shaped, uppercase.
* **Buttons (Tertiary - Small):** White background, black text, pill-shaped, used inside project cards ("VIEW DETAIL >").
* **Images:** All featured images utilize smooth, rounded corners (`border-radius: 24px` approx).

---

### 3. Layout & Structure

#### 3.1. Navigation (Header)
* **Logo:** Left-aligned, featuring a geometric triangle mark and "UntoldArch" in bold sans-serif.
* **Links:** Centered (Properties, Services, Interiors, Expertise). Clean, no underlines.
* **CTA:** Right-aligned "LET'S TALK >" in a dark pill button.

#### 3.2. Hero Section
* **Social Proof (Top Left):** Three overlapping user avatars (circular) followed by "500+ Happy Clients" in small, stacked text.
* **Massive Typography ("untold"):** * Takes up the central horizontal space.
    * The letter "o" is replaced by a custom circular graphic: a white circle containing a minimalist, continuous-line illustration of a person interacting with a lightbulb and a planet, surrounded by thin, offset orange concentric rings.
* **Floating Image (Right):** An image of an organic, desert-style architectural building. The image is tilted slightly (approx. 15 degrees) and has rounded corners.
* **Sub-content (Bottom Left):** Heavy, condensed sans-serif text block: "WE BLEND ART & SCIENCE TO CREATE ARCHITECTURAL MAGIC."
* **Sub-content (Bottom Right):** A short descriptive paragraph aligned right, followed by a terracotta "VIEW ALL PROJECTS >" button. Faint, intersecting geometric lines span across the background behind this text.

#### 3.3. Project Showcase (Bottom Grid/Carousel)
* A horizontal layout of cards, seemingly acting as a horizontal scroll or carousel.
* **Project Cards (Atlas Residence / Nova Office Hub):**
    * Split design: Left half is an image (rounded outer corners), right half is a dark card containing project metadata (Title, Year, Category) and a "VIEW DETAIL >" button.
* **Award Card:** A solid dark card with a white laurel wreath graphic and "AWARD-WINNING ARCHITECTURE STUDIO" text.

---

### 4. Animations & Interactions

#### 4.1. Micro-Interactions (Hover States)
* **Navigation Links:** On hover, a subtle opacity drop (to 60%) or a small orange dot appears below the active link.
* **Buttons:** * *Scale:* On hover, buttons scale up slightly (`transform: scale(1.05)`).
    * *Arrow:* The `>` icon translates slightly to the right (`transform: translateX(4px)`).
    * *Color:* The terracotta button deepens in color.
* **Project Cards:** On hover, the image inside the card zooms in slightly (`transform: scale(1.05)`) with a slow, smooth transition (`transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)`), while the dark container remains fixed. 

#### 4.2. Scroll & Load Animations
* **Hero Reveal (Load):**
    * The main "unt ld" text slides up from a mask (staggered letter by letter) over 0.8s.
    * The center circular 'o' graphic scales up from 0 to 1 with a slight bounce effect.
    * The floating image on the right fades in and drifts into its tilted position from a lower, straight position.
* **Graphic Rotation:** The offset orange concentric rings around the central 'o' graphic slowly rotate infinitely on a 20-second linear loop.
* **Parallax Scroll:** * As the user scrolls down, the floating architectural image on the right moves upward at a faster rate than the background (parallax effect).
    * The faint geometric background lines shift slightly based on mouse movement (mousemove parallax).
* **Card Reveal (Scroll into view):** The bottom project cards slide up and fade in sequentially (staggered by 0.1s) as they enter the viewport.

#### 4.3. Carousel Interaction
* The bottom section acts as a drag-to-scroll carousel. On desktop, users can click and drag horizontally. A custom cursor (e.g., "< Drag >") should appear when hovering over this section.
