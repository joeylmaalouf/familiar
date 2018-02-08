import re
import requests

BASE_URL = r'http://archivesofnethys.com/' # thanks, AoN!
SPELL_LIST_REGEX = r'<b><a href="(?P<link>.+?)">(?:<img.*?>\s?){0,2}(?P<name>.+?)(?:</b><sup>.</sup><b>)*</a></b>: (?P<shortdesc>.*?)<br />'
SPELL_REGEX = r'<b>Level</b> (?P<level>.+?)<' # TODO: update to pull more than just level


def parse_powers(page_ext, list_regex,  power_regex, process_fn = None):
    """Parse a generic list of powers for the details of each one."""
    powers = []
    # first, get the contents of the page that lists the powers
    list_page = requests.get(BASE_URL + page_ext).text
    # and look through them for entries that match our expression
    list_re = re.compile(list_regex)
    for match in list_re.finditer(list_page):
        # for each match, save the details we pulled from the list
        power = match.groupdict()
        # if the power has a link to its own page, go parse that
        if ('link' in power):
            # get the contents of its info page
            power_page = requests.get(BASE_URL + power['link']).text
            # and look for the detailed information we want
            power_re = re.compile(power_regex)
            power_info = power_re.search(power_page).groupdict()
            # add this new information to what we collected from the list
            power.update(power_info)
        # if a processing function is supplied, run it on the power
        if (process_fn):
            power = process_fn(power)
        # and put the parsed power in the list to be returned
        powers.append(power)
    return powers


def process_spell(spell):
    """Processes spell data into a more usable format."""
    # TODO: "druid 5, sorcerer/wizard 4" => {"druid": 5, "sorcerer": 4, "wizard": 4}
    # TODO: get race restriction from level string? or just change regex? (probably the latter)
    # TODO: convert alt codes back to punctuation
    # TODO: whatever other processing we need to do
    return spell


def main():
    spells = parse_powers('Spells.aspx?Class=All', SPELL_LIST_REGEX, SPELL_REGEX, process_spell)
    # hexes = parse_powers('WitchHexes.aspx', HEX_LIST_REGEX, HEX_REGEX, process_hex)
    # etc. (yay generalization)
    print(spells)


if __name__ == '__main__':
    main()
