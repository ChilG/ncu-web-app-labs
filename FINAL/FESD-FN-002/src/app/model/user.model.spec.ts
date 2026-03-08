import { User } from './user.model';

describe('User Model getAge() Tests', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
  });

  // TC-01: Past date this year (1990-01-01) -> 34 (assuming current year is 2024 per exam prompt "TC-01... = 34")
  it('TC-01: Should return correct age for a past birthday in the current year', () => {
    // We mock the current date to be a fixed date in 2024 to make tests deterministic like the rubric
    jasmine.clock().install();
    const baseTime = new Date('2024-10-15T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '1990-01-01';
    expect(user.getAge()).toBe(34);

    jasmine.clock().uninstall();
  });

  // TC-02: Today is exact birthday
  it('TC-02: Should return correct age when today is exact birthday (boundary)', () => {
    jasmine.clock().install();
    const baseTime = new Date('2024-05-20T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '1990-05-20';
    expect(user.getAge()).toBe(34);

    jasmine.clock().uninstall();
  });

  // TC-03: Birthday hasn't happened this year
  it('TC-03: Should return correct age before birthday occurs in current year', () => {
    jasmine.clock().install();
    // Assuming today's date is before Dec 31
    const baseTime = new Date('2024-10-15T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '1990-12-31';
    expect(user.getAge()).toBe(33);

    jasmine.clock().uninstall();
  });

  // TC-04: Just born (Today's date)
  it('TC-04: Should return 0 for a baby born today', () => {
    jasmine.clock().install();
    const baseTime = new Date('2024-05-20T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '2024-05-20';
    expect(user.getAge()).toBe(0);

    jasmine.clock().uninstall();
  });

  // TC-05: Leap year birthday
  it('TC-05: Should return correct age for a leap year birthday', () => {
    jasmine.clock().install();
    const baseTime = new Date('2024-10-15T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '2000-02-29';
    expect(user.getAge()).toBe(24);

    jasmine.clock().uninstall();
  });

  // TC-06: Invalid Future Date
  it('TC-06: Should throw Error for future date', () => {
    jasmine.clock().install();
    const baseTime = new Date('2024-10-15T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '2025-01-01';
    expect(() => user.getAge()).toThrowError(/Invalid Date: Date of birth cannot be in the future/);

    jasmine.clock().uninstall();
  });

  // TC-07: Invalid Format
  it('TC-07: Should throw Error for invalid date format', () => {
    user.dateOfBirth = '31/02/1990';
    expect(() => user.getAge()).toThrowError(/Invalid Date format/);
  });

  // TC-08: Null or undefined
  it('TC-08: Should throw Error for Null or undefined', () => {
    // @ts-ignore
    user.dateOfBirth = null;
    expect(() => user.getAge()).toThrowError(/Missing Data: dateOfBirth is null or undefined/);
    
    // @ts-ignore
    user.dateOfBirth = undefined;
    expect(() => user.getAge()).toThrowError(/Missing Data: dateOfBirth is null or undefined/);
  });

  // TC-09: Max edge case (older than 100)
  it('TC-09: Should correctly return age for old dates (edge case)', () => {
    jasmine.clock().install();
    const baseTime = new Date('2024-10-15T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '1900-01-01';
    expect(user.getAge()).toBe(124);

    jasmine.clock().uninstall();
  });

  // TC-10: Boundary month, day before bday
  it('TC-10: Should return correct age for day before birthday (Boundary)', () => {
    jasmine.clock().install();
    const baseTime = new Date('2024-05-20T00:00:00Z');
    jasmine.clock().mockDate(baseTime);

    user.dateOfBirth = '1990-05-21';
    expect(user.getAge()).toBe(33);

    jasmine.clock().uninstall();
  });
});
