/**
 * Test script to verify the weekly digest date calculation fix.
 * This script simulates the getPreviousWeekStartDateString function
 * and tests it with various dates to ensure it correctly returns
 * the previous week's Sunday.
 * 
 * February 2026 Calendar:
 * Su Mo Tu We Th Fr Sa
 *  1  2  3  4  5  6  7
 *  8  9 10 11 12 13 14
 * 15 16 17 18 19 20 21
 * 22 23 24 25 26 27 28
 */

/** Get start of PREVIOUS week (Sunday) in timezone as YYYY-MM-DD. */
function getPreviousWeekStartDateString(timezone: string, testDate?: Date): string {
    const now = testDate || new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "short",
    }).formatToParts(now);
    const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "0", 10);
    const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "0", 10);
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const daysBack = dayMap[weekday] ?? 0;
    // Get current week's Sunday, then subtract 7 days to get previous week's Sunday
    const currentSunday = new Date(year, month - 1, day - daysBack);
    const previousSunday = new Date(currentSunday);
    previousSunday.setDate(currentSunday.getDate() - 7);
    return `${previousSunday.getFullYear()}-${String(previousSunday.getMonth() + 1).padStart(2, "0")}-${String(previousSunday.getDate()).padStart(2, "0")}`;
}

// Test cases - Feb 16, 2026 is a MONDAY (not Sunday!)
const testCases = [
    {
        date: new Date("2026-02-15T20:00:00Z"),
        timezone: "UTC",
        description: "Sunday, Feb 15 at 8pm UTC",
        currentWeekSunday: "2026-02-15",
        expected: "2026-02-08"
    },
    {
        date: new Date("2026-02-16T20:00:00Z"),
        timezone: "UTC",
        description: "Monday, Feb 16 at 8pm UTC",
        currentWeekSunday: "2026-02-15",
        expected: "2026-02-08"
    },
    {
        date: new Date("2026-02-17T10:00:00Z"),
        timezone: "UTC",
        description: "Tuesday, Feb 17 at 10am UTC",
        currentWeekSunday: "2026-02-15",
        expected: "2026-02-08"
    },
    {
        date: new Date("2026-02-22T10:00:00Z"),
        timezone: "UTC",
        description: "Sunday, Feb 22 at 10am UTC",
        currentWeekSunday: "2026-02-22",
        expected: "2026-02-15"
    },
    {
        date: new Date("2026-02-23T10:00:00Z"),
        timezone: "UTC",
        description: "Monday, Feb 23 at 10am UTC",
        currentWeekSunday: "2026-02-22",
        expected: "2026-02-15"
    },
    // EST timezone tests
    {
        date: new Date("2026-02-16T15:00:00-05:00"),
        timezone: "America/New_York",
        description: "Monday, Feb 16 at 3pm EST",
        currentWeekSunday: "2026-02-15",
        expected: "2026-02-08"
    },
];

console.log("Testing Weekly Digest Date Calculation Fix");
console.log("=".repeat(80));
console.log();

let allPassed = true;

testCases.forEach((testCase, index) => {
    const result = getPreviousWeekStartDateString(testCase.timezone, testCase.date);
    const passed = result === testCase.expected;
    allPassed = allPassed && passed;

    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Timezone:          ${testCase.timezone}`);
    console.log(`  Test Date:         ${testCase.date.toISOString()}`);
    console.log(`  Current week Sun:  ${testCase.currentWeekSunday}`);
    console.log(`  Previous week Sun: ${testCase.expected} (EXPECTED)`);
    console.log(`  Function returns:  ${result} (ACTUAL)`);
    console.log(`  ${status}`);
    console.log();
});

console.log("=".repeat(80));
if (allPassed) {
    console.log("✅ All tests passed!");
    console.log();
    console.log("The fix is working correctly:");
    console.log("• When the cron runs, it returns the PREVIOUS week's Sunday");
    console.log("• This ensures users get a summary of their completed week");
    console.log("• Entries from the previous week (Sun-Sat) will now be counted correctly");
    console.log();
    console.log("Example: If cron runs on Sunday Feb 22, it will check entries from");
    console.log("         Feb 15 (Sun) through Feb 21 (Sat) - the completed week.");
} else {
    console.log("❌ Some tests failed. Please review the implementation.");
}
