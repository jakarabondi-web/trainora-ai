import assert from "node:assert/strict";
import test from "node:test";
import { parseJobsCsv } from "../lib/job-import.ts";

const header = "title,clientName,discipline,description,requirements,rateMin,rateMax,rateUnit,hoursPerWeek,location,requiredQualityScore,openings";

test("parses a well-formed jobs CSV", () => {
  const csv = `${header}\nMedical QA,Cinder Research,Medicine,"Evaluate answers","Medical degree|95% agreement",5,8,task,10-15,Remote,92,24`;
  const [job] = parseJobsCsv(csv);
  assert.equal(job.title, "Medical QA");
  assert.equal(job.clientName, "Cinder Research");
  assert.deepEqual(job.requirements, ["Medical degree", "95% agreement"]);
  assert.equal(job.rateMin, 5);
  assert.equal(job.rateMax, 8);
  assert.equal(job.openings, 24);
});

test("rejects a CSV missing a required column", () => {
  const csv = "title,clientName,discipline\nA,B,C";
  assert.throws(() => parseJobsCsv(csv), /Missing required CSV column: description/);
});

test("rejects a row missing a required value", () => {
  const csv = `${header}\n,Cinder Research,Medicine,"Evaluate answers","",5,8,task,10-15,Remote,92,24`;
  assert.throws(() => parseJobsCsv(csv), /Row 2 is missing a required value/);
});

test("clamps quality score and openings to sane bounds", () => {
  const csv = `${header}\nJob,Client,Discipline,Desc,"",5,8,task,10-15,Remote,150,0`;
  const [job] = parseJobsCsv(csv);
  assert.equal(job.requiredQualityScore, 100);
  assert.equal(job.openings, 1);
});

test("rejects more than 200 jobs in a single import", () => {
  const rows = Array.from({ length: 201 }, (_, i) => `Job ${i},Client,Discipline,Desc,"",5,8,task,10-15,Remote,90,1`);
  const csv = `${header}\n${rows.join("\n")}`;
  assert.throws(() => parseJobsCsv(csv), /Import no more than 200 jobs/);
});
