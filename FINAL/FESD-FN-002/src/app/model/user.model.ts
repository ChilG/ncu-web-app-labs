export class User {
  userEmail!: string;
  userPassword?: string;
  userFirstName!: string;
  userLastName!: string;
  userTel!: string;
  dateOfBirth!: string | Date;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }

  // 3.1.1: Calculate age from dateOfBirth returning age in years
  getAge(): number | string {
    if (!this.dateOfBirth) {
       throw new Error('Missing Data: dateOfBirth is null or undefined');
    }

    const birthDate = new Date(this.dateOfBirth);
    
    // Check for invalid date (Invalid Date object returns NaN for getTime)
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid Date format');
    }

    const today = new Date();
    
    // Check for future date
    if (birthDate > today) {
      throw new Error('Invalid Date: Date of birth cannot be in the future');
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
