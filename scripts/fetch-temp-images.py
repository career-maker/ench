# Downloads the temporary Unsplash stock photos listed in TEMP into assets/images/temp/<name>-temp.webp
# and rewrites docs/image-manifest.md. To replace one with a client image: overwrite the file, keep the name.
# Usage: python scripts/fetch-temp-images.py
import os, urllib.request
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
U = 'https://images.unsplash.com/photo-'
# name: (unsplash id, width, page / section)
TEMP = {
 'destinations-hero': ('1563492065599-3520f775eeed', 1920, 'destinations.html hero'),
 'dest-bangkok': ('1762950297550-1d8d7cce12ae', 1600, 'destination-bangkok.html hero+card; home destinations tab'),
 'dest-bangkok-city': ('1523731407965-2430cd12f5e4', 1600, 'destination-bangkok.html supporting'),
 'dest-chiang-mai': ('1512553353614-82a7370096dc', 1600, 'destination-chiang-mai.html hero+card; home tab'),
 'dest-pattaya': ('1625793061481-8c36fdc131a4', 1600, 'destination-pattaya.html hero+card; home tab'),
 'dest-ayutthaya': ('1768745267604-d34ec845ffed', 1600, 'destination-ayutthaya.html hero+card; home tab'),
 'dest-hua-hin': ('1589447415265-a842e421daf6', 1600, 'destination-hua-hin.html hero+card; home tab'),
 'cel-hub-hero': ('1724142773252-67d11f690bb4', 1920, 'celebrations-events.html hero'),
 'cel-01-weddings': ('1724142589737-ff96776e60c6', 1400, 'Destination Weddings'),
 'cel-02-leadership': ('1582417746450-046ddc1f2163', 1400, 'Leadership Retreats'),
 'cel-03-themed': ('1517263904808-5dc91e3e7044', 1400, 'Themed Celebrations'),
 'cel-04-gala': ('1536392706976-e486e2ba97af', 1400, 'Private Gala Dinners'),
 'cel-05-awards': ('1650240852447-46505dba4726', 1400, 'Awards Nights'),
 'cel-06-brand': ('1560523160-754a9e25c68f', 1400, 'Brand Launches'),
 'cel-07-anniversary': ('1770135005669-0094609c733e', 1400, 'Corporate Anniversaries'),
 'cel-08-parties': ('1758272133693-d2124dbe00de', 1400, 'Private Parties & Reunions'),
 'cel-09-client': ('1740120424442-ccd013ec9581', 1400, 'Client Appreciation'),
 'cel-10-music': ('1565035010268-a3816f98589a', 1400, 'Live Music & Entertainment'),
 'cel-11-after': ('1758165532022-a68f291317ba', 1400, 'Exclusive After-Parties'),
 'luxe-hero': ('1580098584182-0d695fab86ab', 1920, 'luxe-experiences.html hero'),
 'luxe-01-andaman': ('1526761122248-c31c93f8b2b9', 1400, 'The Andaman Afterglow'),
 'luxe-02-residence': ('1759372945658-1e9f56e751bd', 1400, 'The Private Residence Collection'),
 'luxe-03-muaythai': ('1525680996651-0222228be6f0', 1400, 'The Ultimate Muay Thai Takeover'),
 'luxe-04-serenity': ('1585970480901-90d6bb2a48b5', 1400, 'Wild Serenity'),
 'luxe-05-bangkok': ('1523731407965-2430cd12f5e4', 1400, 'The Bangkok Social Edit'),
 'luxe-06-wild': ('1658846058611-5b5f340da5ba', 1400, 'The Wild, Beautifully Uncovered'),
 'luxe-07-siam': ('1774520504555-1afc8a82e024', 1400, 'The Soul of Siam'),
 'luxe-08-river': ('1708706395413-7caf209c8cb4', 1400, 'Beyond the Boardroom: The River Retreat'),
 'luxe-09-lanna': ('1599576838688-8a6c11263108', 1400, 'The Lanna Estate Takeover'),
 'luxe-10-skyborne': ('1761828122700-11b752d69a88', 1400, 'The Skyborne Collective'),
 'leisure-hero': ('1677053694723-b13b41063f92', 1920, 'leisure.html hero'),
 'leisure-fit': ('1608478063152-f5ac066721ea', 1400, 'FIT'),
 'leisure-fixed': ('1775326714947-759837c872cb', 1400, 'Fixed Departures'),
 'leisure-social': ('1788029992390-97408345719c', 1400, 'Social Events & Getaways'),
 'leisure-family': ('1695425812104-8a9963d58887', 1400, 'Family Holidays'),
 'leisure-private': ('1582268611958-ebfd161ef9cf', 1400, 'Private Getaways'),
 'leisure-concierge': ('1522255272218-7ac5249be344', 1400, 'Private Travel & Personal Concierge'),
 'mice-conference': ('1576085898323-218337e3e43c', 1400, 'mice.html Conferences & Exhibitions; home MICE gallery'),
 'mice-gala': ('1768508950719-4d76978fdf44', 1400, 'mice.html Gala Dinners & Awards Nights; home MICE gallery'),
 'mice-launch': ('1560523160-754a9e25c68f', 1400, 'mice.html Product Launches & Brand Events'),
 'mice-team': ('1653566031587-74f7d86a2e71', 1400, 'mice.html Corporate Meetings'),
 'mice-themed': ('1470229722913-7c0e2dbbafd3', 1400, 'mice.html Themed Events & Bespoke Concepts'),
 'mice-retreat': ('1775326714947-759837c872cb', 1400, 'mice.html Team Experiences & Corporate Retreats'),
}
rows = ['# Temporary image manifest', '', 'Unsplash stock photos (free licence). Replace by overwriting the file in `assets/images/temp/` with the same name (webp, ~3:2).', '', '| File | Unsplash ID | Used on |', '|---|---|---|']
os.makedirs(os.path.join(root, 'assets/images/temp'), exist_ok=True)
for name, (pid, w, use) in TEMP.items():
    out = os.path.join(root, f'assets/images/temp/{name}-temp.webp')
    if not os.path.exists(out):
        h = round(w * (9 / 16 if w >= 1920 else 2 / 3))  # heroes 16:9, everything else 3:2
        urllib.request.urlretrieve(f'{U}{pid}?w={w}&h={h}&fit=crop&q=72&fm=webp', out)
    rows.append(f'| `{name}-temp.webp` | `{pid}` | {use} |')
open(os.path.join(root, 'docs/image-manifest.md'), 'w', encoding='utf8').write('\n'.join(rows) + '\n')
print(len(TEMP), 'images')
