from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Add the new community categories to the existing beta UI.
s = re.sub(
    r"const cats=\[(.*?)\];",
    "const cats=[['all','✨ All'],['Outdoors','🌿 Outdoors'],['Games','🎲 Games'],['Creative','🎨 Creative'],['Sport','⚽ Sport'],['Social','🍻 Social'],['Culture','🎭 Culture'],['Learning','📚 Learning'],['Language Learning','🗣️ Language Learning'],['Music Fans','🎵 Music Fans']];",
    s,
    count=1,
    flags=re.S,
)

# Add representative demo groups before the groups array closes.
marker = "{id:'g12',type:'group',icon:'🏕️',name:'Camping & Campfires',category:'Outdoors',place:'Regional',members:58,desc:'Weekend camping, walks and low-key outdoor adventures.'}\n];"
replacement = "{id:'g12',type:'group',icon:'🏕️',name:'Camping & Campfires',category:'Outdoors',place:'Regional',members:58,desc:'Weekend camping, walks and low-key outdoor adventures.'},\n{id:'g13',type:'group',icon:'🗣️',name:'Language Learning Exchange',category:'Language Learning',place:'Local cafes',members:47,desc:'Practice languages together through relaxed conversation and cultural exchange.'},\n{id:'g14',type:'group',icon:'🎵',name:'Music Fans & Gig Buddies',category:'Music Fans',place:'Local venues',members:73,desc:'Find people who love the same artists, gigs, festivals and sounds.'}\n];"
s = s.replace(marker, replacement)

# Add representative events.
marker = "{id:'e8',type:'event',icon:'💃',name:'Beginner Dance Night',category:'Social',place:'Dance hall',date:'Fri',people:40,desc:'No partner required.'}\n];"
replacement = "{id:'e8',type:'event',icon:'💃',name:'Beginner Dance Night',category:'Social',place:'Dance hall',date:'Fri',people:40,desc:'No partner required.'},\n{id:'e9',type:'event',icon:'🗣️',name:'Language Café',category:'Language Learning',place:'Local cafe',date:'Wed',people:24,desc:'Swap languages, meet learners and practise in a friendly setting.'},\n{id:'e10',type:'event',icon:'🎵',name:'Gig Buddies Meetup',category:'Music Fans',place:'Live music venue',date:'Sat',people:30,desc:'Meet fellow music fans before the show and head in together.'}\n];"
s = s.replace(marker, replacement)

p.write_text(s, encoding='utf-8')
