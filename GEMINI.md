Below is the instruction on building a webpage of my portfolio. 
webpage name: freezer 
web icon: sumOfMeow.jpg

# Copyright Notice
Add a footer or dedicated section visible on the site:
"© 2026 Maple / meowfunction.xyz. All rights reserved. Works displayed here may not be reproduced, distributed, or used without explicit permission."

Optional: Include in robots.txt to discourage AI crawlers:
```
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /
```

# Collectibles
**Songs** (hidden throughout the exhibition, 3 total):
- "minorDaisyBell.wav"
- "lighthouseBytheSea.wav" 
- "ASpaceOdyssey.mp3"

When all 3 songs are collected, the secret room becomes accessible.

# Scene 1: Welcome
**background**
	base color of the background: FFFAE8
	particles: small dots of colors [FF4215, FFD215, 157BFF]
	motion of particles: colorful dots forming, start from small and clear, then get increasingly blurry and disappear eventually. Randomly and evenly distributed. 

**character and dialogue** 
	1. dialogue: "Hi! I'm Maple. Welcome to my home. Is it your first time here?"  
	   character image: catGreet.png
		choices: ["Yes", "No"]
		if "Yes":
			dialogue: "Brilliant! You should pay the entrance fee. Type in the box to pay."
			character image: catPraise.png
			input: a box that asks the user to type in exactly "You have the best domain ever!". Press enter to proceed to 2. $\textcolor{red}{\text{(Note: on mobile, add a forward arrow button after the textbox since enter key is unavailable)}}$
		if "No":
			dialogue: "Welcome back! But you still have to pay the entrance fee~"
			character image: catPraise.png
			input: a box that asks the user to type in exactly "Your works are amazing!". Press enter to proceed to 2. $\textcolor{red}{\text{(Note: on mobile, add a forward arrow button after the textbox since enter key is unavailable)}}$
	2. dialogue: "Take your time to look around. You can get free ice cream on the top of the screen." 
	   character image: catIce.png
		choices: ["Thank you"] proceed to scene 2.

# Scene 2: The Freezer (Exhibition Lobby)

**General Description**
A top-down exhibition space. The player controls a visitor character and can walk around freely using arrow keys or WASD (on desktop) or joystick/touch controls (on mobile).

**Interaction System**
- When the player approaches an exhibit on the wall, a small eye icon appears
- Pressing the interaction button (spacebar on desktop, tap on mobile) opens a detailed view of the artwork with description
- Exhibits are hung on the walls inside each room

**Layout**
```
                    ↑ secret room (hidden until all songs collected)
    ┌───────────────────────────────────────────────┐
    │                                               │
    │   ┌─────────┐   ┌───────────┐   ┌─────────┐   │
    │   │         │   │           │   │         │   │
    │   │ culinary│   │ ice cream │   │ design  │   │
    │   │         │   │           │   │  room   │   │
    │   └─────────┘   └───────────┘   └─────────┘   │
    │                                               │
    │   ┌─────────┐                   ┌─────────┐   │
    │   │         │                   │         │   │
    │   │ illus-  │                   │ poetry  │   │
    │   │ tration │                   │         │   │
    │   └─────────┘                   └─────────┘   │
    │                                               │
    └───────────────────────────────────────────────┘
```

**Ice Cream Station**
- Located at top center of lobby
- Maple cat is at the ice cream counter, giving out free ice cream
- Visual: ice cream counter or freezer display
- The door to the secret room is behind/blocked by the ice cream counter
- Door becomes accessible when all 3 songs are collected

**Room Entrances**
- Each room has a doorway/opening the player walks through
- Rooms contain exhibits on walls that player can approach and interact with

# Room Contents

## Culinary Room
Exhibits:
- ChatGPTDot.png — (add description)
- ItalyPasta.png — (add description)
- Hamwich.png — (add description)
- BananaMage.png — (add description)
- HotdogToothpaste.png — (add description)

## Design Room
Exhibits:
- MagrittePhoneCase.png — (add description)
- GoldenRatio.png — (add description)
- FoxtailVase.png — (add description)
- AGIHoodie.png — (add description)

## Illustration Room
Exhibits:
- ImBach.png — (add description)
- PiecedAnimals.png — (add description)
- Neowsletter.png — (add description)
- BriefSpring.png — (add description)

## Poetry Room
Exhibits:
- (to be added)

## Secret Room
See Scene 3.

# Scene 3: Secret Room (Joke Room)
Unlocks when all 3 songs are collected. Entered through the door behind the ice cream counter.

Contents:
- (to be added - jokes and chaos)
