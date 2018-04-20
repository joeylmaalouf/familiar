import copy
import json
import re
import requests

from resources import BASE_URL, ARCANA, ARCANE_DISCOVERY, DOMAIN, EXPLOIT, HEX, SPELL


def read_link(page_requests):
    """ Read the contents of one or more page(s) on the base site and combine them (without any newlines). """
    text = ''
    for request in page_requests:
        if request['method'] == 'GET':
            text += requests.get(BASE_URL + request['path']).text
        elif request['method'] == 'POST':
            text += requests.post(BASE_URL + request['path'], data = request['params']).text
    return text.replace('\n', '').replace('\r', '')


def parse_powers(page_requests, list_regex, power_defaults = None, power_regexes = None, process_fn = None, exceptions_fn = None):
    """ Parse a generic list of powers for the details of each one. """
    powers = []

    # first, get the contents of the page that lists the powers
    list_page = read_link(page_requests)
    # and look through them for entries that match our expression
    list_re = re.compile(list_regex)
    for match in list_re.finditer(list_page):
        # for each match, save the details we pulled from the list
        # (overwriting some of the default values if any are provided)
        power = copy.deepcopy(power_defaults) if power_defaults else {}
        power.update(match.groupdict())

        # if the power has a link to its own page, go parse that
        if power_regexes and ('link' in power):
            # get the contents of its info page
            power_page = read_link([{'path': power['link'], 'method': 'GET', 'params': {}}])
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

    # if a special exceptions function is supplied, run it on the power list
    if exceptions_fn:
        powers = exceptions_fn(powers)

    return powers


def save_json(json_data, filename, directory = 'data/'):
    """ Write our parsed data to a json file for importing into the database. """
    with open(directory + filename + '.json', 'w') as outfile:
        data_string = json.dumps(
            json_data, separators = (',', ': '),
            sort_keys = True, indent = 4,
            ensure_ascii = False
        ).encode('utf-8')
        outfile.write(data_string)


def main():
    """ Runs the main parsing function on each list of powers and saves the resulting data. """
    for power_type in [ARCANA, ARCANE_DISCOVERY, DOMAIN, EXPLOIT, HEX, SPELL]:
        powers = parse_powers(
            power_type['requests'],
            power_type['list_regex'],
            power_type['defaults'],
            power_type['power_regexes'],
            power_type['process_fn'],
            power_type['exceptions_fn']
        )
        save_json(powers, power_type['filename'])


if __name__ == '__main__':
    main()
