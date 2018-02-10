# thanks, AoN!
BASE_URL = r'http://archivesofnethys.com/'

# spells
SPELL_DEFAULTS = {
    'casttime'   : None,
    'components' : None,
    'duration'   : None,
    'level'      : None,
    'link'       : None,
    'longdesc'   : None,
    'name'       : None,
    'restriction': None,
    'range'      : None,
    'save'       : None,
    'school'     : None,
    'shortdesc'  : None,
    'spellres'   : None,
    'target'     : None
}
SPELL_LIST_REGEX = r'<b><a href="(?P<link>.*?)">(?:<img.*?>\s?){0,2}(?P<name>.*?)(?:</b><sup>.</sup><b>)*</a></b>: (?P<shortdesc>.*?)<br />'
SPELL_REGEXES = [
    r'<h1 class="title">(?:<img.*?>)* ?(?P<name>.*?)</h1>',
    r'<b>School</b> (?P<school>.*?)(?:;|<)',
    r'<b>Level</b> (?P<level>.*?)(?: (?<=\d )\((?P<restriction>.*?)\))?<',
    r'<b>Casting Time</b> (?P<casttime>.*?)<',
    r'<b>Components</b> (?P<components>.*?)<',
    r'<b>Range</b> (?P<range>.*?)<',
    r'<b>(?:Area|Effect|Target)</b> (?P<target>.*?)<',
    r'<b>Duration</b> (?P<duration>.*?)<',
    r'<b>Saving Throw</b> (?P<save>.*?)(?:;|<)',
    r'<b>Spell Resistance</b> (?P<spellres>.*?)<',
    r'>Description</h3>(?P<longdesc>.*?)</?(?:span|h1|h2)'
]
