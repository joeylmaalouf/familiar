import copy
import json
import re
import requests

from resources import *


def parse_powers(page_ext, list_regex, power_default = None, power_regexes = None, process_fn = None):
    """Parse a generic list of powers for the details of each one."""
    powers = []

    # first, get the contents of the page that lists the powers
    list_page = requests.get(BASE_URL + page_ext).text.replace('\n', '').replace('\r', '')
    # and look through them for entries that match our expression
    list_re = re.compile(list_regex)
    for match in list_re.finditer(list_page):
        # for each match, save the details we pulled from the list
        # (overwriting some of the default values if any are provided)
        power = copy.deepcopy(power_default) if power_default else {}
        power.update(match.groupdict())

        # if the power has a link to its own page, go parse that
        if power_regexes and ('link' in power):
            # get the contents of its info page
            power_page = requests.get(BASE_URL + power['link']).text.replace('\n', '').replace('\r', '')
            # make sure we can process multiple queries
            if isinstance(power_regexes, str):
                power_regexes = [power_regexes]
            # and look for the detailed information we want from each of them
            for power_regex in power_regexes:
                power_re = re.compile(power_regex)
                power_result = power_re.search(power_page)
                # check for any results from each query
                if power_result:
                    power_info = power_result.groupdict()
                    # add this new information to what we collected from the list
                    power.update(power_info)

        # if a processing function is supplied, run it on the power
        if process_fn:
            power = process_fn(power)
        # and put the parsed power in the list to be returned
        powers.append(power)

    return powers


def process_spell(spell):
    """Processes spell data into a more usable format."""

    # strip any leading and trailing whitespace in all of our spell's properties
    for prop in spell:
        if spell[prop]:
            spell[prop] = spell[prop].strip()

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


def main():
    """Runs the main parsing function on each list of powers and saves the resulting data."""

    spells = parse_powers('Spells.aspx?Class=All', SPELL_LIST_REGEX, SPELL_DEFAULTS, SPELL_REGEXES, process_spell)
    # hexes = parse_powers('WitchHexes.aspx', HEX_LIST_REGEX, HEX_DEFAULTS, HEX_REGEXES, process_hex)
    # etc. (yay generalization)

    # write our parsed data to a json file for importing into the database
    with open('spells.json', 'w') as outfile:
        data_string = json.dumps(spells, sort_keys = True, indent = 4, ensure_ascii = False).encode('utf-8')
        outfile.write(data_string)


if __name__ == '__main__':
    main()
