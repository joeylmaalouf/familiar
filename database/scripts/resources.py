import re

# thanks, AoN!
BASE_URL = r'http://archivesofnethys.com/'


# ------------------------------------------------------------------------------
# all spells
# ------------------------------------------------------------------------------

SPELL_DEFAULTS = {
    'casttime'   : None,
    'components' : None,
    'duration'   : None,
    'level'      : None,
    'link'       : None,
    'longdesc'   : None,
    'name'       : None,
    'range'      : None,
    'restriction': None,
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

def process_spell(spell):
    """ Processes spell data into a more usable format. """

    # turn a spell level string into a dict of classes and spell levels
    level_regex = re.compile(r'(?P<class0>.+?)(?:/(?P<class1>.+))? (?P<level>\d+)')
    level_dict = {}
    for level_pair in spell['level'].split(', '):
        results = level_regex.search(level_pair)
        if results:
            match = results.groupdict()
            level_dict[match['class0']] = int(match['level'])
            if match['class1']:
                level_dict[match['class1']] = int(match['level'])
    spell['level'] = level_dict

    # turn a components string into a list of components and a dict of any accompanying details
    component_split_regex = re.compile(r', (?![^()]*\))')
    component_regex = re.compile(r'(?P<type>\w+)(?: \((?P<details>.+?)\))?')
    components_list = []
    components_dict = {}
    components = component_split_regex.split(spell['components'])
    for component in components:
        results = component_regex.search(component)
        if results:
            match = results.groupdict()
            components_list.append(match['type'])
            if match['details'] is not None:
                components_dict[match['type']] = match['details']
    spell['components'] = {
        'list': components_list,
        'details': components_dict
    }

    return spell


# ------------------------------------------------------------------------------
# wizard arcane discoveries
# ------------------------------------------------------------------------------

ARCANE_DISCOVERY_DEFAULTS = {
    'description': None,
    'name'       : None,
    'restriction': None,
    'spectype'   : None
}

ARCANE_DISCOVERY_REGEX = r'<td>\s*<span.*?><b>(?:<img.*?>\s*)*(?P<name>.*?)\s*(?:\((?P<spectype>Ex|Su|Sp)\))?</b>.*?\): (?P<description>.*?(?P<restriction>You must.*?to (select|choose) this discovery\.)?)<hr /></span>\s*</td>'

def process_arcane_discovery(arcane_discovery):
    """ Processes arcane discovery data into a more usable format. """

    # turn a restriction sentence into a dict of restriction types
    restriction = arcane_discovery['restriction']
    if restriction:
        restriction_dict = {
            'bond' : None,
            'feat' : None,
            'level': None
        }
        bond_regex = re.compile(r'must have chosen (?P<bond>.+?) as your arcane bond')
        feat_regex = re.compile(r'must have the (?P<feat>.+?) feat')
        level_regex = re.compile(r'must be at least an? (?P<level>\d+?)[a-zA-Z]{2}-level wizard')
        for regex in [bond_regex, feat_regex, level_regex]:
            results = regex.search(restriction)
            if results:
                restriction_dict.update(results.groupdict())
        if restriction_dict['level']:
            restriction_dict['level'] = int(restriction_dict['level'])
        arcane_discovery['restriction'] = restriction_dict

    return arcane_discovery


# ------------------------------------------------------------------------------
# witch hexes
# ------------------------------------------------------------------------------

HEX_DEFAULTS = {
    'category'   : None,
    'description': None,
    'name'       : None,
    'spectype'   : None
}

HEX_REGEX = r'<td>\s*<span id="(?P<category>.*?)".*?><i>(?:<img.*?>\s*)*(?P<name>.*?)\s*(?:\((?P<spectype>Ex|Su|Sp)\))?</i>.*?\): (?P<description>.*?)<hr /></span>\s*</td>'

def process_hex(hex):
    """ Processes arcane discovery data into a more usable format. """

    # turn a hex section id into a hex category
    category = hex['category'].split('_')[2]
    hex['category'] = {
        'DataListTypes': 'common',
        'DataList1'    : 'major',
        'DataList2'    : 'grand'
    }[category]

    return hex
