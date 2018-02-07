import re
import requests


def parse_spells():
    # thanks, AoN!
    page = requests.get('http://archivesofnethys.com/Spells.aspx?Class=All').text
    regex = re.compile(r'<b><a href="(?P<link>.+?)">(?:<img.*?>\s?){0,2}(?P<name>.+?)(?:</b><sup>.</sup><b>)*</a></b>: (?P<desc>.*?)<br />')
    for result in regex.finditer(page):
        print(result.groupdict())
        # TODO: go to spell's link and get more detailed data

def main():
    parse_spells()


if __name__ == "__main__":
    main()
