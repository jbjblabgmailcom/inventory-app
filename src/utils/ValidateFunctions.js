export const validateName = (name) => {
  // Regex: only letters (a-z, A-Z) and digits (0-9), 1 to 20 characters
  if (name === null) {
    return false;
  }
  const regex = /^[a-zA-Z0-9ąćęłńóśżźĄĆĘŁŃÓŚŻŹ ]{1,20}$/;
  return regex.test(name);
};



/**
 * Validate barcode string
 * Supports: EAN-13, EAN-8, UPC-A, Code39
 * @param {string} code
 * @returns {string|boolean} returns the type of barcode if valid, false if invalid
 */
export const validateBarcode = (code) => {
  const trimmed = code.trim();

  // EAN-13: 13 digits
  if (/^\d{13}$/.test(trimmed)) return "EAN-13";

  // EAN-8: 8 digits
  if (/^\d{8}$/.test(trimmed)) return "EAN-8";

  // UPC-A: 12 digits
  if (/^\d{12}$/.test(trimmed)) return "UPC-A";

  // Code39: uppercase letters, digits, - . $ / + % SPACE
  if (/^[A-Z0-9\-\.\$\/\+\% ]+$/.test(trimmed)) return "Code39";

  // invalid
  return false;
};

export const validateProductQty = (qtyStr) => {
  const qty = Number(qtyStr);

  // Check if it's a number, integer, and > 0
  if (!Number.isInteger(qty) && Number(qty) < 0) return false;

  return true;
};

export const validateDescription = (desc) => {
  if (typeof desc !== "string") return false;
  const trimmed = desc.trim();
  if (trimmed.length === 0 || trimmed.length > 200) return false;
  return true;
};


export const validateDateForSQLite = (dateInput) => {
  let date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    // try to parse string
    date = new Date(dateInput);
  }

  // Check if valid date
  if (isNaN(date.getTime())) return false;

  // Optional: check year range if needed
  const year = date.getFullYear();
  if (year < 1900 || year > 9999) return false;

  return true;
};

export const dateToSQLiteCurrent = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid Date object");
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");

  return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

export const dateToSQLite = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid Date object");
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d} ${'00'}:${'00'}:${'00'}`;
};

export const dateToSQLiteDateOnly = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid Date object");
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const dateToSQLiteEndOfDay = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid Date object");
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  

  return `${y}-${m}-${d} ${'23'}:${'59'}:${'59'}`;
};

export const dateFromSQLiteDateOnly = (date) => {
  
  const newDate = date.split(' ');
  return newDate[0];
};

 
export const SQLiteToTextInput = (date) => {
  if (!date || typeof date !== 'string') throw new Error("Invalid SQLite date string");

  const [year, month, day] = date.split('-').map(Number);
  return String(new Date(year, month - 1, day)); // JS Date object
};


export const numberOfDaysToDate = (dateString) => {
  const target = new Date(`${dateString}T00:00:00`);
  if (isNaN(target.getTime())) {
    throw new Error("Invalid date string");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  return Math.round(diffMs / MS_PER_DAY);
};