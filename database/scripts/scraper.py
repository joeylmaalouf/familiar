import copy
import json
import re
import requests

from resources import *


def parse_powers(page_ext, list_regex, power_default = None, power_regexes = None, process_fn = None):
    """ Parse a generic list of powers for the details of each one. """
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

        # strip any leading and trailing whitespace in all of our power's properties
        for prop in power:
            if power[prop]:
                power[prop] = power[prop].strip()

        # if a processing function is supplied, run it on the power
        if process_fn:
            power = process_fn(power)
        # and put the parsed power in the list to be returned
        powers.append(power)

    return powers


def save_json(json_data, filename):
    """ Write our parsed data to a json file for importing into the database. """
    with open(filename, 'w') as outfile:
        data_string = json.dumps(json_data, sort_keys = True, indent = 4, ensure_ascii = False).encode('utf-8')
        outfile.write(data_string)


def main():
    """ Runs the main parsing function on each list of powers and saves the resulting data. """

    # all spells
    spells = parse_powers('Spells.aspx?Class=All', SPELL_LIST_REGEX, SPELL_DEFAULTS, SPELL_REGEXES, process_spell)
    save_json(spells, 'spells.json')

    # wizard arcane discoveries
    arcane_discoveries = parse_powers('WizardArcaneDiscoveries.aspx', ARCANE_DISCOVERY_REGEX, ARCANE_DISCOVERY_DEFAULTS, None, process_arcane_discovery)
    save_json(arcane_discoveries, 'arcane_discoveries.json')

    # witch hexes
    hexes = parse_powers('WitchHexes.aspx', HEX_REGEX, HEX_DEFAULTS, None, process_hex)
    save_json(hexes, 'hexes.json')


if __name__ == '__main__':
    main()
