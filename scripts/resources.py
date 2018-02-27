import re

# thanks, AoN!
BASE_URL = r'https://www.archivesofnethys.com/'


# ------------------------------------------------------------------------------
# all spells
# ------------------------------------------------------------------------------

spell_defaults = {
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

spell_list_regex = r'<b><a href="(?P<link>.*?)">(?:<img.*?>\s?)*(?P<name>.*?)(?:</b><sup>.</sup><b>)*</a></b>: (?P<shortdesc>.*?)<br />'

spell_regexes = [
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

SPELL = {
    'defaults'     : spell_defaults,
    'filename'     : 'spells',
    'list_regex'   : spell_list_regex,
    'path'         : 'Spells.aspx?Class=All',
    'power_regexes': spell_regexes,
    'process_fn'   : process_spell
}


# ------------------------------------------------------------------------------
# wizard arcane discoveries
# ------------------------------------------------------------------------------

arcane_discovery_defaults = {
    'description': None,
    'name'       : None,
    'restriction': None,
    'spectype'   : None
}

arcane_discovery_regex = r'<td>\s*<span.*?><b>(?:<img.*?>\s*)*(?P<name>.*?)\s*(?:\((?P<spectype>Ex|Su|Sp)\))?</b>.*?\): (?P<description>.*?(?P<restriction>You must.*?to (?:select|choose) this (?:arcane )?discovery\.).*?)<hr /></span>\s*</td>'

def process_arcane_discovery(arcane_discovery):
    """ Processes arcane discovery data into a more usable format. """
    # turn the restriction sentence into a dict of restriction types
    restriction = arcane_discovery['restriction']
    if restriction:
        restriction_dict = {
            'bond' : None,
            'feat' : None,
            'level': None
        }
        bond_regex = re.compile(r'must have chosen (?P<bond>.+?) as your arcane bond')
        feat_regex = re.compile(r'must have the (?P<feat>.+?) feat')
        level_regex = re.compile(r'must be at least (?:an? )?(?P<level>\d+?)[a-zA-Z]{2}[ -]level(?: wizard)?')
        for regex in [bond_regex, feat_regex, level_regex]:
            results = regex.search(restriction)
            if results:
                restriction_dict.update(results.groupdict())
        level = restriction_dict['level']
        if level:
            restriction_dict['level'] = int(level)
        arcane_discovery['restriction'] = restriction_dict
    return arcane_discovery

ARCANE_DISCOVERY = {
    'defaults'     : arcane_discovery_defaults,
    'filename'     : 'arcane_discoveries',
    'list_regex'   : arcane_discovery_regex,
    'path'         : 'WizardArcaneDiscoveries.aspx',
    'power_regexes': None,
    'process_fn'   : process_arcane_discovery
}


# ------------------------------------------------------------------------------
# witch hexes
# ------------------------------------------------------------------------------

hex_defaults = {
    'category'   : None,
    'description': None,
    'name'       : None,
    'spectype'   : None
}

hex_regex = r'<td>\s*<span id="(?P<category>.*?)".*?><i>(?:<img.*?>\s*)*(?P<name>.*?)\s*(?:\((?P<spectype>Ex|Su|Sp)\))?</i>.*?\): (?P<description>.*?)<hr /></span>\s*</td>'

def process_hex(hex):
    """ Processes hex data into a more usable format. """
    # turn a hex section id into a hex category
    category = hex['category'].split('_')[2]
    hex['category'] = {
        'DataListTypes': 'common',
        'DataList1'    : 'major',
        'DataList2'    : 'grand'
    }[category]
    return hex

HEX = {
    'defaults'     : hex_defaults,
    'filename'     : 'hexes',
    'list_regex'   : hex_regex,
    'path'         : 'WitchHexes.aspx',
    'power_regexes': None,
    'process_fn'   : process_hex
}


# ------------------------------------------------------------------------------
# cleric domains
# ------------------------------------------------------------------------------

domain_defaults = {
    'deities'   : None,
    'link'      : None,
    'name'      : None,
    'powers'    : None,
    'spells'    : None,
    'subdomains': None
}

subdomain_defaults = {
    'deities'     : None,
    'name'        : None,
    'powers'      : None,
    'spells'      : None,
    'superdomains': None
}

domain_regex = r'<tr.*?href="(?P<link>.*?)">(?:<img.*?>\s?)?(?P<name>.*?)</.*?<td>(?P<subdomains>.*?)</td><td>(?P<deities>.*?)</td>\s*</tr>'

domain_regexes = [
    r'Granted Powers</b>: (?P<powers>.*?)(?:<br />)*<b>Domain Spells',
    r'Domain Spells</b>: (?P<spells>.*?)\.',
    r'<br />(?P<sdtext><h2.*?/h2>.*?)(?:<h1|</span>)'
]

def process_domain(domain):
    """ Processes domain data into a more usable format. """
    domain = _process_domain(domain, False)
    # turn a subdomain string into a list of subdomains
    subdomains = domain['subdomains']
    subdomains_regex = re.compile(r'.*?>(?P<list>.*?)<.*?')
    results = subdomains_regex.search(subdomains)
    if results:
        subdomains_dict = {}
        subdomain_list = results.groupdict()['list'].split(', ')
        for subdomain_name in subdomain_list:
            subdomain_regex = re.compile(r'> ?' + subdomain_name + r' Subdomain</.*?<b>Associated Domain\(s\)</b>: (?P<superdomains>.*?)(?:<br />)*<b>Associated Deities</b>: (?P<deities>.*?)(?:<br />)*<b>Replacement Powers?</b>: (?P<powers>.*?)(?:<br />)*<b>Replacement Domain Spells</b>: (?P<spells>.*?)\..*?(?:<(?:h1|h2)|</span>|<br />)')
            subdomain = subdomain_defaults.copy()
            subdomain['name'] = subdomain_name
            match = subdomain_regex.search(domain['sdtext'])
            if match:
                subdomain.update(match.groupdict())
                subdomain['superdomains'] = subdomain['superdomains'].split(', ')
                subdomain = _process_domain(subdomain, True)
            subdomains_dict[subdomain_name] = subdomain
        domain['subdomains'] = subdomains_dict
    del(domain['sdtext'])
    return domain

def _process_domain(domain, is_subdomain = False):
    """ process_domain helper function. """
    # turn a deities string into a list of deities
    deities = domain['deities']
    deities_regex = re.compile(r'<a.*?>(?P<deity>.*?)</a>')
    domain['deities'] = deities_regex.findall(deities)
    # turn a powers string into a list of powers
    powers = domain['powers'].replace('<i>', '').replace('</i>', '').split('<br /><br />')
    # if it's a normal domain, ignore the flavor text
    # if it's a subdomain, keep the replacement notice and attach it to the first power
    # (which should be the only one, but we have support for more in the list just in case)
    if is_subdomain:
        domain['powers'] = [powers[0] + '<br />' + powers[1]] + powers[2:]
    else:
        domain['powers'] = powers[1:]
    # turn a spells string into a list of spells, with level and name split on the emdash
    spells = domain['spells'].replace('<i>', '').replace('</i>', '').split(', ')
    spells_dict = {}
    for spell in spells:
        spell_data = spell.replace(u'\u2014', '-').split('-', 1)
        spells_dict[spell_data[0].strip()] = spell_data[1].strip()
    domain['spells'] = spells_dict
    return domain

DOMAIN = {
    'defaults'     : domain_defaults,
    'filename'     : 'domains',
    'list_regex'   : domain_regex,
    'path'         : 'ClericDomains.aspx',
    'power_regexes': domain_regexes,
    'process_fn'   : process_domain
}


# ------------------------------------------------------------------------------
# magus arcana
# ------------------------------------------------------------------------------

arcana_defaults = {
    'description': None,
    'name'       : None,
    'restriction': None,
    'spectype'   : None
}

arcana_regex = r'<td>\s*<span.*?><i>(?:<img.*?>\s*)*(?P<name>.*?)\s*(?:\((?P<spectype>Ex|Su|Sp)\))?</i>.*?\): (?P<description>.*?)<hr /></span>\s*</td>'

def process_arcana(arcana):
    """ Processes arcana data into a more usable format. """
    # parse restriction from description
    restriction_regex = re.compile(r'The magus (?P<restriction>must .*?) (?:before|to) (?:he )?select(?:s|ing)?(?: this (?:magus )?arcana\.)?')
    results = restriction_regex.search(arcana['description'])
    if results:
        restriction = results.groupdict()['restriction']
        if restriction:
            restriction_dict = {
                'arcana' : None,
                'class'  : None,
                'feature': None,
                'level'  : None
            }
            arcana_regex = re.compile(r'have the (?P<arcana>.*?) (?:magus )?arcana')
            class_regex = re.compile(r'(?:have|possess) levels in (?P<class>.*)')
            feature_regex = re.compile(r'have (?P<feature>ranged spellstrike)')
            level_regex = re.compile(r'be at least (?P<level>\d+?)[a-zA-Z]{2}[- ]level')
            for regex in [arcana_regex, class_regex, feature_regex, level_regex]:
                results = regex.search(restriction)
                if results:
                    restriction_dict.update(results.groupdict())
            level = restriction_dict['level']
            if level:
                restriction_dict['level'] = int(level)
            arcana['restriction'] = restriction_dict
    return arcana

ARCANA = {
    'defaults'     : arcana_defaults,
    'filename'     : 'arcana',
    'list_regex'   : arcana_regex,
    'path'         : 'MagusArcana.aspx',
    'power_regexes': None,
    'process_fn'   : process_arcana
}
