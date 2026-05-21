import { toDayKey } from "@/lib/date-utils";
import {
  DEFAULT_PROFILE,
  DEFAULT_MED_EVENTS,
  defaultPatients,
  getMedEvents,
  getPatient,
  getPatientByToken,
  getPatients,
  getPatientsForDay,
} from "@/lib/practice-store";

export const clinician = DEFAULT_PROFILE;
export const patients = defaultPatients;
export const medEventsByPatient = DEFAULT_MED_EVENTS;
export {
  getMedEvents,
  getPatient,
  getPatientByToken,
  getPatients,
  getPatientsForDay,
};

export function getTodayPatients() {
  return getPatientsForDay(toDayKey(new Date()));
}
