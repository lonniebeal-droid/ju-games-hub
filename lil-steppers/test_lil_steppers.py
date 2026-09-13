from pathlib import Path
p=Path(__file__).with_name('index.html')
s=p.read_text()
checks={
 'Blessing character': 'BLESSING' in s and "Blessing's Block Party" in s,
 'Star rewards': 'lsStars' in s and '⭐' in s,
 'Streak': 'streak' in s,
 'Levels persist': 'lsLevel' in s and 'localStorage' in s,
 'Hazards': 'silly' in s,
 'Dash action': 'function boost()' in s,
 'Dance action': 'function dance()' in s,
 'Mission replay': 'function newRound()' in s,
 'Celebration': 'function celebrate()' in s,
 'Mobile viewport': 'maximum-scale=1' in s,
}
for k,v in checks.items(): print(('PASS' if v else 'FAIL'), k)
assert all(checks.values())
print(f'PASS {len(checks)}/{len(checks)} Lil Steppers upgrade checks')