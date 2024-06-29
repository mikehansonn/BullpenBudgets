import datetime

# Define the epoch date (January 1, 1970)
epoch_date = datetime.date(1970, 1, 1)

# Define the target date
target_date = datetime.date(2024, 5, 21)

# Calculate the difference in days
ordinal_date_from_epoch = (target_date - epoch_date).days

print("Ordinal date from epoch:", ordinal_date_from_epoch)
