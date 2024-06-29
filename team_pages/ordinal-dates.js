function daysSinceEpoch(month, day, year) {
    // Create a date object for the given date
    const givenDate = new Date(year, month - 1, day);
  
    // Create a date object for the Unix epoch
    const epoch = new Date(1970, 0, 1);
  
    // Calculate the difference in milliseconds
    const diffInMilliseconds = givenDate - epoch;
  
    // Convert the difference from milliseconds to days
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
  
    return Math.ceil(diffInDays); // Use Math.floor to get a whole number of days
  }