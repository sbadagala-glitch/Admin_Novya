
// src/components/Progress.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Modal,
  Alert,
  Collapse,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
  FaSync,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { useDashboard } from "../../DashboardContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

// ---------- Config ----------
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const DEFAULT_SUBJECTS = ["Math", "Science", "English", "Social"];
// ----------------------------

// Helper to calculate subject averages for dataset format
const calcSubjectAvgFromStudents = (students, subjects) => {
  if (!students || students.length === 0) {
    return subjects.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  }
  const avg = {};
  subjects.forEach((sub) => {
    const sum = students.reduce((t, st) => {
      // st.scores may be undefined, st.scores[sub] might be undefined or non-numeric -> coerce to 0
      const val = Number(
        (st.scores && (st.scores[sub] ?? st.scores?.[sub.toLowerCase()])) || 0
      );
      return t + (isNaN(val) ? 0 : val);
    }, 0);
    avg[sub] = Math.round(sum / students.length);
  });
  return avg;
};

// Normalize a single student record from backend to UI-friendly shape
const normalizeStudent = (raw, subjectsList = []) => {
  // raw may contain: id or student_id, name or student_name, scores (object), average, top_subject / topSubject, improvement, completion, ai_insight / aiInsight
  const id =
    raw.id ??
    raw.student_id ??
    raw.userid ??
    raw.user_id ??
    raw._id ??
    null;
  const name =
    raw.name ?? raw.student_name ?? raw.full_name ?? raw.display_name ?? "";
  // scores may be under a variety of keys; if it's not present, attempt to infer from subject keys in raw
  let scores = raw.scores ?? raw.score ?? raw.subject_scores ?? null;
  if (!scores && subjectsList && subjectsList.length && raw) {
    // try to build a scores object picking values from raw by subject key (case-insensitive)
    scores = {};
    subjectsList.forEach((s) => {
      const low = s.toLowerCase();
      // prefer raw.scores if present; else try raw[subject], raw[subject.toLowerCase()]
      const candidate = raw[s] ?? raw[low] ?? null;
      scores[s] = candidate != null ? Number(candidate) : null;
    });
  }
  // ensure scores keys exist for each subject name (do not mutate originals)
  if (!scores) scores = {};
  // compute average if missing
  const scoreValues = Object.values(scores)
    .map((v) => Number(v ?? 0))
    .filter((v) => !isNaN(v));
  const averageFromScores = scoreValues.length
    ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
    : null;
  const average = raw.average ?? raw.avg ?? averageFromScores ?? 0;

  const topSubject = raw.topSubject ?? raw.top_subject ?? raw.best_subject ?? "";
  const improvement =
    raw.improvement ?? raw.improve ?? raw.improvement_pct ?? 0;
  const completion = raw.completion ?? raw.completion_percentage ?? 0;
  const aiInsight =
    raw.aiInsight ?? raw.ai_insight ?? raw.ai_insights ?? "";

  return {
    id,
    name,
    scores,
    average,
    topSubject,
    improvement,
    completion,
    aiInsight,
    // preserve raw for debugging/future use:
    __raw: raw,
  };
};

const Progress = () => {
  const {
    dashboardView,
    selectedParentEmail,
    parentChildren,
    setParentChildren,
    selectedChildId,
    setSelectedChildId,
  } = useDashboard(); // student | parent | teacher

  // Common UI states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------- REAL DATA states (no demo/random logic) ----------
  const [realData, setRealData] = useState([]); // always use real backend data
  const [useRealData] = useState(true); // forced to true per C1
  const [selectedClass, setSelectedClass] = useState(7);
  const [assessmentType, setAssessmentType] = useState("mocktest");
  const [searchTerm, setSearchTerm] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editClassIdx, setEditClassIdx] = useState(null);
  const [expandedClasses, setExpandedClasses] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parent-related state (kept as before) including selected child progress
  const [selectedChildProgress, setSelectedChildProgress] = useState(null);

  // ---------- SUBJECTS: dynamic (calls backend), fallback to DEFAULT_SUBJECTS ----------
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const loadSubjectsForRole = async (role, opts = {}) => {
    try {
      // endpoint: /api/dashboard/{role}/subjects
      let url = `${API_BASE_URL}/api/dashboard/${role}/subjects`;
      // optional query: class, board
      const params = new URLSearchParams();
      if (opts.class) params.set("class", opts.class);
      if (opts.board) params.set("board", opts.board);
      if ([...params].length) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        setSubjects(DEFAULT_SUBJECTS);
        return;
      }
      const data = await res.json();
      if (data && Array.isArray(data.subjects) && data.subjects.length) {
        setSubjects(data.subjects);
      } else {
        setSubjects(DEFAULT_SUBJECTS);
      }
    } catch (err) {
      setSubjects(DEFAULT_SUBJECTS);
    }
  };

  // watch dashboard view -> load subjects for that role (class option for student/teacher)
  useEffect(() => {
    if (dashboardView === "student") {
      loadSubjectsForRole("student", { class: selectedClass });
    } else if (dashboardView === "teacher") {
      loadSubjectsForRole("teacher", { class: selectedClass });
    } else {
      // parent: we will call subjects when child selected
      setSubjects(DEFAULT_SUBJECTS);
    }
    // eslint-disable-next-line
  }, [dashboardView, selectedClass]);

  // ---------- STUDENT: load real data per class/assessment ----------
  const fetchStudentRealData = async (
    cls = selectedClass,
    assessment = assessmentType
  ) => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/dashboard/student/progress?class=${cls}&assessment=${assessment}`;
      const res = await fetch(url);
      if (!res.ok) {
        setRealData([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      // expected shape: { className: "Class 7", students: [{id,name,scores:{},average,...}], subjectAverages: {...}, subjects: [] }
      if (data && data.students) {
        // determine subjects from returned data first, fallback to infer from students, fallback to current subjects state, then DEFAULT_SUBJECTS
        let subjectsList = [];
        if (Array.isArray(data.subjects) && data.subjects.length) {
          subjectsList = data.subjects;
        } else {
          // infer from students' scores keys (take union of keys)
          const keys = new Set();
          data.students.forEach((st) => {
            const sc = st.scores ?? st.score ?? st.subject_scores ?? {};
            if (sc && typeof sc === "object") {
              Object.keys(sc).forEach((k) => keys.add(k));
            } else {
              // if sc is null, try to pick subject keys from top-level student fields (case-insensitive)
              Object.keys(st).forEach((k) => {
                const lk = k.toLowerCase();
                if (DEFAULT_SUBJECTS.map((s) => s.toLowerCase()).includes(lk))
                  keys.add(k);
              });
            }
          });
          subjectsList = Array.from(keys);
        }
        if (!subjectsList || subjectsList.length === 0) {
          // fallback to current subjects or default
          subjectsList = subjects && subjects.length ? subjects : DEFAULT_SUBJECTS;
        }

        // normalize students
        const normalizedStudents = data.students.map((st) =>
          normalizeStudent(st, subjectsList)
        );

        // compute subject averages either from data.subjectAverages or calculate from normalized students
        const subjectAverages =
          data.subjectAverages && Object.keys(data.subjectAverages).length
            ? data.subjectAverages
            : calcSubjectAvgFromStudents(normalizedStudents, subjectsList);

        // keep subjects state in sync so charts use same labels
        setSubjects(subjectsList);

        setRealData([
          {
            className: data.className || `Class ${cls}`,
            students: normalizedStudents,
            subjectAverages,
            subjects: subjectsList,
          },
        ]);
      } else {
        setRealData([]);
      }
    } catch (err) {
      console.error("student progress load error", err);
      setRealData([]);
    }
    setLoading(false);
  };

  // Always fetch real data for student view (C1)
  useEffect(() => {
    if (dashboardView === "student") {
      fetchStudentRealData(selectedClass, assessmentType);
    }
    // eslint-disable-next-line
  }, [selectedClass, assessmentType, dashboardView]);

  // ---------- PARENT: multi-child handling ----------
  // load children list when admin has selected a parent
  useEffect(() => {
    const loadParentChildren = async () => {
      if (!selectedParentEmail) {
        // clear if no parent impersonated
        setParentChildren([]);
        setSelectedChildId(null);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/dashboard/parent/${encodeURIComponent(
            selectedParentEmail
          )}/children`
        );
        if (!res.ok) {
          setParentChildren([]);
          setSelectedChildId(null);
          return;
        }
        const data = await res.json();
        setParentChildren(data || []);
        if (data && data.length) {
          setSelectedChildId((prev) => prev || data[0].student_id);
        } else {
          setSelectedChildId(null);
        }
      } catch (err) {
        console.error("loadParentChildren error", err);
        setParentChildren([]);
        setSelectedChildId(null);
      }
    };

    if (dashboardView === "parent") {
      loadParentChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardView, selectedParentEmail]);

  // load selected child progress (for impersonated parent)
  useEffect(() => {
    const loadParentChildProgress = async (student_id) => {
      if (!selectedParentEmail || !student_id) {
        setSelectedChildProgress(null);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/dashboard/parent/${encodeURIComponent(
            selectedParentEmail
          )}/progress`
        );
        if (!res.ok) {
          setSelectedChildProgress(null);
          return;
        }
        const data = await res.json();
        // data.children = [ ... ] — find matching student_id
        if (!data || !Array.isArray(data.children)) {
          setSelectedChildProgress(null);
          return;
        }
        const child = data.children.find(
          (c) => Number(c.student_id) === Number(student_id)
        );

        if (!child) {
          setSelectedChildProgress(null);
          return;
        }

        // normalize child data
        const subjectsList =
          Array.isArray(child.subjects) && child.subjects.length
            ? child.subjects
            : subjects;
        const normalized = {
          student_id: child.student_id,
          child_name:
            child.child_name ?? child.name ?? child.student_name ?? `Student ${child.student_id}`,
          average: child.average ?? child.avg ?? 0,
          best_subject:
            child.best_subject ?? child.top_subject ?? child.topSubject ?? "",
          weak_subject: child.weak_subject ?? "",
          completion: child.completion ?? 0,
          subjects: subjectsList,
          scores: child.scores ?? child.score ?? child.subject_scores ?? {},
          ai_insight: child.ai_insight ?? child.aiInsight ?? "",
          __raw: child,
        };

        // sync UI subjects if returned
        if (Array.isArray(child.subjects) && child.subjects.length) {
          setSubjects(child.subjects);
        }

        setSelectedChildProgress(normalized);
      } catch (err) {
        console.error("loadParentChildProgress error", err);
        setSelectedChildProgress(null);
      }
    };

    if (selectedChildId) {
      loadParentChildProgress(selectedChildId);
    } else {
      setSelectedChildProgress(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId, selectedParentEmail]);

  // ---------- TEACHER: class-level analytics ----------
  const [teacherClass, setTeacherClass] = useState(7);
  const [teacherClassProgress, setTeacherClassProgress] = useState(null);

  const loadTeacherClassProgress = async (cls = teacherClass) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/teacher/progress?class=${cls}`
      );
      if (!res.ok) {
        setTeacherClassProgress(null);
        return;
      }
      const data = await res.json();
      // expected data: { className, subjectAverages, students: [...] }
      // normalize students
      const subjectsList =
        (Array.isArray(data.subjects) && data.subjects.length)
          ? data.subjects
          : subjects && subjects.length
          ? subjects
          : DEFAULT_SUBJECTS;

      const normalizedStudents = Array.isArray(data.students)
        ? data.students.map((st) => normalizeStudent(st, subjectsList))
        : [];

      const subjectAverages =
        data.subjectAverages && Object.keys(data.subjectAverages).length
          ? data.subjectAverages
          : calcSubjectAvgFromStudents(normalizedStudents, subjectsList);

      const normalized = {
        className: data.className ?? `Class ${cls}`,
        subjectAverages,
        students: normalizedStudents,
        classAverage: data.classAverage ?? undefined,
        top_student: data.top_student ?? data.topStudent ?? {},
        bottom_student: data.bottom_student ?? data.bottomStudent ?? {},
        subjects: subjectsList,
        __raw: data,
      };

      setTeacherClassProgress(normalized);
      if (data && Array.isArray(data.subjects) && data.subjects.length) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error("loadTeacherClassProgress error", err);
      setTeacherClassProgress(null);
    }
  };

  useEffect(() => {
    if (dashboardView === "teacher") {
      loadTeacherClassProgress(teacherClass);
    }
    // eslint-disable-next-line
  }, [dashboardView, teacherClass]);

  // ---------- Shared UI helpers ----------
  const exportToPDF = () => {
    const input = document.getElementById("progress-report");
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("progress_report.pdf");
    });
  };

  const toggleClassExpansion = (classIdx) => {
    setExpandedClasses((prev) => ({ ...prev, [classIdx]: !prev[classIdx] }));
  };

  // ---------- Render CHILD UIs inside the same file ----------
  // 1) StudentProgressUI: reuse your existing UI (kept minimal changes)
  const StudentProgressUI = () => {
    const currentData = realData; // always real data in C1
    const filtered = currentData
      .map((cls, idx) => {
        const students = (cls.students || []).filter(
          (s) =>
            (s.name || "")
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            String(s.id || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchClass = (cls.className || "")
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const useStudents = matchClass ? cls.students || [] : students;
        // subject averages should be computed from selected set to keep chart / table consistent on search
        const subjectAverages = calcSubjectAvgFromStudents(
          useStudents,
          cls.subjects || subjects || DEFAULT_SUBJECTS
        );
        return {
          ...cls,
          students: useStudents,
          subjectAverages,
        };
      })
      .filter((cls) => (cls.students && cls.students.length) || !searchTerm);

    return (
      <div>
        <Alert variant="info" className="text-center mb-3">
          📊 AI Insights & Student Progress Tracking (Student View)
          {useRealData && (
            <Badge bg="success" className="ms-2">
              Live Data
            </Badge>
          )}
        </Alert>

        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Data Source</Form.Label>
                  {/* kept visually but locked to Real Data (no demo) */}
                  <Form.Select value="real" disabled size="sm">
                    <option value="real">Real Data</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Class</Form.Label>
                  <Form.Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                    size="sm"
                  >
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Assessment</Form.Label>
                  <Form.Select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    size="sm"
                  >
                    <option value="mocktest">Mock Tests</option>
                    <option value="quiz">Quick Practice</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by student ID, name, or class..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <div className="d-flex gap-2 w-100">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      fetchStudentRealData(selectedClass, assessmentType)
                    }
                    disabled={loading}
                  >
                    <FaSync /> {loading ? "..." : "Refresh"}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={exportToPDF}
                  >
                    <FaDownload />
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">Loading student data from backend...</p>
          </div>
        ) : (
          <div id="progress-report">
            {filtered.map((cls, idx) => (
              <div key={idx} className="mb-4">
                <Card className="shadow">
                  <Card.Body>
                    <div
                      className="d-flex justify-content-between align-items-center cursor-pointer"
                      onClick={() => isMobile && toggleClassExpansion(idx)}
                    >
                      <h4 className="mb-0">
                        {cls.className} - Group Insights
                        {useRealData && (
                          <Badge bg="success" className="ms-2">
                            Live
                          </Badge>
                        )}
                      </h4>
                      {isMobile && (
                        <Button variant="link" className="p-0">
                          {expandedClasses[idx] ? <FaChevronUp /> : <FaChevronDown />}
                        </Button>
                      )}
                    </div>

                    <Collapse in={!isMobile || expandedClasses[idx]}>
                      <div>
                        <Row className="mt-3 mb-4">
                          <Col>
                            <div style={{ height: isMobile ? "200px" : "300px" }}>
                              <Bar
                                data={{
                                  labels: cls.subjects || subjects || DEFAULT_SUBJECTS,
                                  datasets: [
                                    {
                                      label: "Average Score",
                                      data: (cls.subjects || subjects || DEFAULT_SUBJECTS).map(
                                        (sub) => cls.subjectAverages?.[sub] ?? 0
                                      ),
                                            backgroundColor: (cls.subjects || subjects || DEFAULT_SUBJECTS).map((_, i) => {
        const COLORS = [
          "#007bff", "#ffc107", "#28a745",
          "#dc3545", "#6f42c1", "#20c997",
          "#fd7e14", "#6610f2"
        ];
        return COLORS[i % COLORS.length];
      }),

                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                      y: {
                                        beginAtZero: true,
                                        suggestedMax: Math.max(
                                          ...Object.values(cls.subjectAverages || {}),
                                          20   // minimum height
                                        ),
                                      }
                                    }
,
                                  plugins: {
                                    legend: { position: isMobile ? "bottom" : "top" },
                                  },
                                }}
                              />
                            </div>
                          </Col>
                        </Row>

                        {!isMobile ? (
                      <div style={{ width: "100%", overflowX: "auto" }}>
                        <Table hover bordered style={{ minWidth: "1400px" }}>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Name</th>
                                  {(cls.subjects || subjects || DEFAULT_SUBJECTS).map((s) => (
                                    <th key={s}>{s}</th>
                                  ))}
                                  <th>Avg</th>
                                  <th>Top</th>
                                  <th>Improvement</th>
                                  <th>Completion</th>
                                  <th>AI Insight</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cls.students.map((s) => (
                                  <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.name}</td>
                                    {(cls.subjects || subjects || DEFAULT_SUBJECTS).map((sub) => (
                                      <td key={sub}>
                                        {(s.scores &&
                                          (s.scores[sub] ?? s.scores[sub.toLowerCase()])) != null
                                          ? `${s.scores[sub] ?? s.scores[sub.toLowerCase()]}%`
                                          : "-"}
                                      </td>
                                    ))}
                                    <td>
                                      <strong>{s.average != null ? `${s.average}%` : "-"}</strong>
                                    </td>
                                    <td>{s.topSubject}</td>
                                    <td>{s.improvement != null ? `${s.improvement}%` : "-"}</td>
                                    <td>{s.completion != null ? `${s.completion}%` : "-"}</td>
                                    <td>{s.aiInsight}</td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="info"
                                        className="me-1"
                                        onClick={() => {
                                          setEditStudent(s);
                                          setEditClassIdx(idx);
                                          setEditModal(true);
                                        }}
                                      >
                                        <FaEdit />
                                      </Button>
                                      {!useRealData && (
                                        <Button
                                          size="sm"
                                          variant="danger"
                                          onClick={() => {
                                            /* delete logic kept in original file if needed */
                                          }}
                                        >
                                          <FaTrash />
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        ) : (
                          <div className="mt-3">
                            {cls.students.map((s) => (
                              <Card key={s.id} className="mb-3 student-card">
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <h6 className="mb-0">{s.name}</h6>
                                      <small className="text-muted">{s.id}</small>
                                    </div>
                                  </div>
                                  <Row className="mb-2">
                                    {(cls.subjects || subjects || DEFAULT_SUBJECTS).map((sub) => (
                                      <Col xs={6} key={sub} className="mb-1">
                                        <small>
                                          {sub}:{" "}
                                          <strong>
                                            {(s.scores &&
                                              (s.scores[sub] ?? s.scores[sub.toLowerCase()])) != null
                                              ? `${s.scores[sub] ?? s.scores[sub.toLowerCase()]}%`
                                              : "-"}
                                          </strong>
                                        </small>
                                      </Col>
                                    ))}
                                  </Row>
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        )}

        <Modal
          show={editModal}
          centered
          onHide={() => setEditModal(false)}
          size={isMobile ? "sm" : "lg"}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editStudent && (
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={editStudent.name} disabled={useRealData} />
                </Form.Group>
                {(editStudent &&
                  (editStudent.scores && Object.keys(editStudent.scores).length
                    ? Object.keys(editStudent.scores)
                    : subjects || DEFAULT_SUBJECTS)).map((sub) => (
                  <Form.Group key={sub} className="mb-2">
                    <Form.Label>{sub} Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      value={
                        editStudent.scores?.[sub] ??
                        editStudent.scores?.[sub.toLowerCase()] ??
                        0
                      }
                      disabled={useRealData}
                    />
                  </Form.Group>
                ))}
                <Form.Group className="mb-2">
                  <Form.Label>AI Insight</Form.Label>
                  <Form.Control value={editStudent.aiInsight} disabled />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            {!useRealData && (
              <Button variant="primary" onClick={() => setEditModal(false)}>
                Save Changes
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  // 2) ParentProgressUI: multi-child selection, simple UI (no edit/delete)
  const ParentProgressUI = () => {
    // Precompute chart labels & values to avoid complex inline expressions that break parsers
    const childLabels = selectedChildProgress?.subjects || subjects || DEFAULT_SUBJECTS;
    const childScores = childLabels.map((s) =>
      Number(
        selectedChildProgress?.scores?.[s] ??
          selectedChildProgress?.scores?.[s.toLowerCase()] ??
          0
      )
    );

    return (
      <div>
        <Alert variant="info" className="text-center mb-3">
          👪 Parent Dashboard — Child Progress (Admin impersonation)
        </Alert>

        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Child</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedChildId || ""}
                    onChange={(e) => setSelectedChildId(Number(e.target.value))}
                  >
                    <option value="">Select a child</option>
                    {parentChildren.map((c) => (
                      <option key={c.student_id} value={c.student_id}>
                        {c.name || c.student_id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button variant="outline-danger" onClick={exportToPDF}>
                  Export PDF
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {!selectedChildProgress ? (
          <div className="text-center p-4 text-muted">
            Select a child to view progress.
          </div>
        ) : (
          <div id="progress-report">
            <Card className="mb-3">
              <Card.Body>
                <h4 className="mb-3">
                  {selectedChildProgress.child_name ||
                    `Student ${selectedChildProgress.student_id}`}
                </h4>
                <Row className="mb-3">
                  <Col md={3}>
                    <Card className="p-2 text-center">
                      <div>
                        <strong>{selectedChildProgress.average ?? "-"}</strong>
                      </div>
                      <small>Average</small>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="p-2 text-center">
                      <div>
                        <strong>{selectedChildProgress.best_subject ?? "-"}</strong>
                      </div>
                      <small>Best Subject</small>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="p-2 text-center">
                      <div>
                        <strong>{selectedChildProgress.weak_subject ?? "-"}</strong>
                      </div>
                      <small>Weak Subject</small>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="p-2 text-center">
                      <div>
                        <strong>{selectedChildProgress.completion ?? "-"}</strong>
                      </div>
                      <small>Completion %</small>
                    </Card>
                  </Col>
                </Row>

                <div style={{ height: isMobile ? 200 : 300 }}>
                  <Bar
                    data={{
                      labels: childLabels,
                      datasets: [
                        {
                          label: "Score",
                          data: childScores,
                          backgroundColor: "#007bff",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { beginAtZero: true, max: 100 } },
                    }}
                  />
                </div>

                <div className="mt-3">
                  <h6>AI Insight</h6>
                  <p>
                    {selectedChildProgress.ai_insight ||
                      "No AI insight available."}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    );
  };

  // 3) TeacherProgressUI: class & student analytics for teacher
  const TeacherProgressUI = () => {
    const classProgress =
      teacherClassProgress || {
        className: `Class ${teacherClass}`,
        subjectAverages: {},
        students: [],
        subjects,
      };
    return (
      <div>
        <Alert variant="info" className="text-center mb-3">
          👩‍🏫 Teacher Dashboard — Class Analytics
        </Alert>

        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Class</Form.Label>
                  <Form.Select
                    size="sm"
                    value={teacherClass}
                    onChange={(e) => setTeacherClass(parseInt(e.target.value))}
                  >
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button variant="outline-danger" onClick={exportToPDF}>
                  Export PDF
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Card className="p-2 text-center">
                  <div>
                    <strong>{classProgress.classAverage ?? "-"}</strong>
                  </div>
                  <small>Class Avg</small>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="p-2 text-center">
                  <div>
                    <strong>{classProgress.top_student?.name ?? "-"}</strong>
                  </div>
                  <small>Top Student</small>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="p-2 text-center">
                  <div>
                    <strong>{classProgress.bottom_student?.name ?? "-"}</strong>
                  </div>
                  <small>Lowest Student</small>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="p-2 text-center">
                  <div>
                    <strong>
                      {Object.keys(classProgress.subjectAverages || {}).length
                        ? Math.round(
                            Object.values(classProgress.subjectAverages).reduce(
                              (a, b) => a + b,
                              0
                            ) /
                              Object.values(classProgress.subjectAverages).length
                          )
                        : "-"}
                    </strong>
                  </div>
                  <small>Avg of Subjects</small>
                </Card>
              </Col>
            </Row>

            <div className="mt-4" style={{ height: isMobile ? 200 : 300 }}>
              <Bar
                data={{
                  labels: classProgress.subjects || subjects,
                  datasets: [
                    {
                      label: "Class Avg",
                      data: (classProgress.subjects || subjects).map(
                        (s) => classProgress.subjectAverages?.[s] ?? 0
                      ),
                      backgroundColor: "#28a745",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, max: 100 } },
                }}
              />
            </div>

            <div className="table-responsive mt-3">
              <Table hover bordered>
                <thead>
                  <tr>
                    <th>Student</th>
                    {(classProgress.subjects || subjects).map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                    <th>Avg</th>
                    <th>AI Insight</th>
                  </tr>
                </thead>
                <tbody>
                  {(classProgress.students || []).map((st) => (
                    <tr key={st.id}>
                      <td>{st.name}</td>
                      {(classProgress.subjects || subjects).map((s) => (
                        <td key={s}>
                          {(st.scores && (st.scores[s] ?? st.scores[s.toLowerCase()])) !=
                          null
                            ? `${st.scores[s] ?? st.scores[s.toLowerCase()]}%`
                            : "-"}
                        </td>
                      ))}
                      <td>
                        <strong>{st.average ?? "-"}</strong>
                      </td>
                      <td>{st.aiInsight ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  // ---------- Main switch ----------
  return (
    <div className="p-2 p-md-3">
      {dashboardView === "student" && <StudentProgressUI />}
      {dashboardView === "parent" && <ParentProgressUI />}
      {dashboardView === "teacher" && <TeacherProgressUI />}
    </div>
  );
};

export default Progress;
