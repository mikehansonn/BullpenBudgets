import json
import datetime
# used to change the stats to prep read to file
# name, last 5 game days outings, last 3 days/7 day/14 days

class Player:
    def __init__(self, name, all_outings):
        self.name = name
        self.all_outings = all_outings  # holds pitch count and ordinal date, 
        self.past_days = [] # holds the pitch total from 3, 7, and 14 days ago
        self.calculate_past_days()


    def add_outing(self, outing):
        self.all_outings.append(outing)
        self.calculate_past_days()

    
    def json_object(self):
        return self.__dict__
    
    def calculate_past_days(self):
        epoch_date = datetime.date(1970, 1, 1)
        target_date = datetime.date.today()
        ordinal_date_from_epoch = (target_date - epoch_date).days

        three = 0
        seven = 0
        fourteen = 0

        for outing in self.all_outings:  # outing is [count, date]
            difference = ordinal_date_from_epoch - outing[1]

            pitches = int(outing[0])
            if difference <= 14:
                fourteen += pitches
                if difference <= 7:
                    seven += pitches
                    if difference <= 3:
                        three += pitches

        self.past_days = [three, seven, fourteen]
