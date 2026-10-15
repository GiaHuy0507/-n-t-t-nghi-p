import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../scss/CreateCV.scss";

const defaultData = {
  fullName: "Nguyễn Văn A",
  title: "Frontend Developer",
  email: "nguyenvana@email.com",
  phone: "0123 456 789",
  location: "Hồ Chí Minh, Việt Nam",
  summary:
    "Lập trình viên frontend yêu thích việc xây dựng sản phẩm dễ sử dụng, hiệu năng tốt và tạo ra giá trị rõ ràng cho người dùng.",
  skills: "React\nJavaScript\nHTML & CSS\nGit",
  experience:
    "Frontend Developer | Công ty ABC | 2023 - Hiện tại\nPhát triển giao diện web bằng React và phối hợp với đội ngũ thiết kế để hoàn thiện sản phẩm.\n\nIntern Developer | Công ty XYZ | 2022 - 2023\nXây dựng các component tái sử dụng và sửa lỗi giao diện trên nhiều thiết bị.",
  education: "Cử nhân Công nghệ thông tin\nĐại học Công nghệ | 2019 - 2023",
  originalCvText: "",
  includeOriginalCvText: false,
};

const draftStorageKey = "cvDrafts";

const getDrafts = () => {
  try {
    const drafts = JSON.parse(localStorage.getItem(draftStorageKey));
    if (Array.isArray(drafts)) return drafts;

    const oldDraft = JSON.parse(localStorage.getItem("cvDraft"));
    return oldDraft
      ? [
          {
            id: `draft-${Date.now()}`,
            name: "Bản nháp cũ",
            data: { ...defaultData, ...oldDraft },
            template: "modern",
            updatedAt: Date.now(),
          },
        ]
      : [];
  } catch {
    return [];
  }
};

const getInitialData = (aiDraft = null) => {
  const firstDraft = getDrafts()[0];
  const baseData = aiDraft?.sourceData
    ? { ...defaultData, ...aiDraft.sourceData }
    : firstDraft
      ? { ...defaultData, ...firstDraft.data }
      : defaultData;
  const allowedFields = ["summary", "skills", "experience", "education"];

  if (
    !aiDraft ||
    !allowedFields.includes(aiDraft.targetField) ||
    !aiDraft.content
  ) {
    return baseData;
  }

  return { ...baseData, [aiDraft.targetField]: aiDraft.content };
};

const getInitialDraft = () => getDrafts()[0] || null;

const splitExperience = (value = "") =>
  value.split("\n\n").filter((item) => item.trim());

const CreateCV = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState(getDrafts);
  const [data, setData] = useState(() =>
    getInitialData(location.state?.aiDraft),
  );
  const [experienceItems, setExperienceItems] = useState(() =>
    splitExperience(getInitialData(location.state?.aiDraft).experience),
  );
  const [draftName, setDraftName] = useState(() =>
    location.state?.aiDraft
      ? "CV từ phân tích AI"
      : getInitialDraft()?.name || "CV của tôi",
  );
  const [currentDraftId, setCurrentDraftId] = useState(() =>
    location.state?.aiDraft ? null : getInitialDraft()?.id || null,
  );
  const [template, setTemplate] = useState(() =>
    location.state?.aiDraft
      ? "modern"
      : getInitialDraft()?.template || "modern",
  );
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [aiAppliedMessage, setAiAppliedMessage] = useState("");
  const previewRef = useRef(null);

  useEffect(() => {
    const aiDraft = location.state?.aiDraft;
    const allowedFields = ["summary", "skills", "experience", "education"];

    if (
      !aiDraft ||
      !allowedFields.includes(aiDraft.targetField) ||
      !aiDraft.content
    ) {
      return;
    }

    setSaved(false);
    setAiAppliedMessage(
      currentDraftId
        ? `Đã áp dụng gợi ý cho phần ${aiDraft.targetField} trong bản nháp hiện tại. Hãy xem lại trước khi lưu hoặc xuất PDF.`
        : `Đã nạp CV từ phân tích AI và áp dụng gợi ý cho phần ${aiDraft.targetField}. Hãy bổ sung thông tin liên hệ còn thiếu, sau đó xem lại trước khi lưu hoặc xuất PDF.`,
    );
    navigate(location.pathname, { replace: true, state: null });
  }, [currentDraftId, location, navigate]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const updateExperienceItems = (nextItems) => {
    setExperienceItems(nextItems);
    setData((current) => ({
      ...current,
      experience: nextItems.join("\n\n"),
    }));
    setSaved(false);
  };

  const addExperience = () => {
    updateExperienceItems([
      ...experienceItems,
      "Chức danh | Tên công ty | Thời gian\nMô tả công việc và thành tích nổi bật.",
    ]);
  };

  const removeExperience = (indexToRemove) => {
    updateExperienceItems(
      experienceItems.filter((_, index) => index !== indexToRemove),
    );
  };

  const saveDraft = () => {
    const now = Date.now();
    const draft = {
      id: currentDraftId || `draft-${now}`,
      name: draftName.trim() || "CV không tên",
      data,
      template,
      updatedAt: now,
    };
    const nextDrafts = currentDraftId
      ? drafts.map((item) => (item.id === currentDraftId ? draft : item))
      : [draft, ...drafts];

    localStorage.setItem(draftStorageKey, JSON.stringify(nextDrafts));
    localStorage.removeItem("cvDraft");
    setDrafts(nextDrafts);
    setCurrentDraftId(draft.id);
    setSaved(true);
  };

  const createNewDraft = () => {
    setData(defaultData);
    setExperienceItems(splitExperience(defaultData.experience));
    setDraftName("CV mới");
    setCurrentDraftId(null);
    setTemplate("modern");
    setSaved(false);
  };

  const loadDraft = (draft) => {
    setData({ ...defaultData, ...draft.data });
    setExperienceItems(splitExperience(draft.data.experience));
    setDraftName(draft.name);
    setCurrentDraftId(draft.id);
    setTemplate(draft.template || "modern");
    setSaved(true);
  };

  const deleteDraft = (draftId) => {
    const nextDrafts = drafts.filter((draft) => draft.id !== draftId);
    localStorage.setItem(draftStorageKey, JSON.stringify(nextDrafts));
    setDrafts(nextDrafts);

    if (draftId === currentDraftId) createNewDraft();
  };

  const exportPdf = async () => {
    if (!previewRef.current || exporting) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${data.fullName || "cv-cua-toi"}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const lines = (value) => value.split("\n").filter((line) => line.trim());

  return (
    <main className="create-cv-page">
      <div className="create-cv-header">
        <div>
          <span className="eyebrow">CV BUILDER</span>
          <h1>Tạo CV chuyên nghiệp</h1>
          <p>Chọn template, điền thông tin và xem trước CV ngay lập tức.</p>
          <label className="draft-name-field">
            Tên bản nháp
            <input
              value={draftName}
              onInput={(event) => {
                setDraftName(event.target.value);
                setSaved(false);
              }}
              placeholder="Ví dụ: CV Frontend Developer"
            />
          </label>
        </div>
        <div className="cv-actions">
          <button type="button" className="btn-new" onClick={createNewDraft}>
            Bản nháp mới
          </button>
          <button type="button" className="btn-save" onClick={saveDraft}>
            {saved ? "Đã lưu bản nháp" : "Lưu bản nháp"}
          </button>
          <button
            type="button"
            className="btn-print"
            onClick={exportPdf}
            disabled={exporting}
          >
            {exporting ? "Đang xuất PDF..." : "Xuất file PDF"}
          </button>
        </div>
      </div>

      {aiAppliedMessage && (
        <p className="ai-applied-notice" role="status">
          {aiAppliedMessage}
        </p>
      )}

      {drafts.length > 0 && (
        <section className="draft-list" aria-label="Danh sách bản nháp">
          <div className="draft-list-heading">
            <h2>Bản nháp đã lưu</h2>
            <span>{drafts.length} bản</span>
          </div>
          <div className="draft-list-items">
            {drafts.map((draft) => (
              <div
                className={`draft-item ${draft.id === currentDraftId ? "active" : ""}`}
                key={draft.id}
              >
                <button type="button" onClick={() => loadDraft(draft)}>
                  <strong>{draft.name}</strong>
                  <small>
                    {new Date(draft.updatedAt).toLocaleString("vi-VN")}
                  </small>
                </button>
                <button
                  type="button"
                  className="draft-delete"
                  onClick={() => deleteDraft(draft.id)}
                  aria-label={`Xóa ${draft.name}`}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="cv-builder-grid">
        <section className="cv-editor" aria-label="Thông tin CV">
          <div className="template-picker">
            <div>
              <h2>Template có sẵn</h2>
              <p>Chọn phong cách phù hợp với bạn.</p>
            </div>
            <div className="template-options">
              <button
                type="button"
                className={template === "modern" ? "active" : ""}
                onClick={() => setTemplate("modern")}
              >
                <span className="template-swatch swatch-modern" />
                Modern
              </button>
              <button
                type="button"
                className={template === "classic" ? "active" : ""}
                onClick={() => setTemplate("classic")}
              >
                <span className="template-swatch swatch-classic" />
                Classic
              </button>
              <button
                type="button"
                className={template === "sidebar" ? "active" : ""}
                onClick={() => setTemplate("sidebar")}
              >
                <span className="template-swatch swatch-sidebar" />
                Sidebar
              </button>
            </div>
          </div>

          <div className="form-section">
            <h2>Thông tin cá nhân</h2>
            <div className="form-grid">
              <label>
                Họ và tên
                <input
                  name="fullName"
                  value={data.fullName}
                  onInput={updateField}
                />
              </label>
              <label>
                Vị trí ứng tuyển
                <input name="title" value={data.title} onInput={updateField} />
              </label>
            </div>
          </div>

          <div className="form-section contact-editor-section">
            <h2>Thông tin góc phải CV</h2>

            <div className="form-grid">
              <label>
                Email
                <input name="email" value={data.email} onInput={updateField} />
              </label>
              <label>
                Số điện thoại
                <input name="phone" value={data.phone} onInput={updateField} />
              </label>
              <label className="full-width">
                Địa chỉ
                <input
                  name="location"
                  value={data.location}
                  onInput={updateField}
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>Nội dung CV</h2>
            <label>
              Giới thiệu bản thân
              <textarea
                name="summary"
                rows="4"
                value={data.summary}
                onInput={updateField}
              />
            </label>
            <label>
              Kỹ năng <span className="field-hint">Mỗi kỹ năng một dòng</span>
              <textarea
                name="skills"
                rows="5"
                value={data.skills}
                onInput={updateField}
              />
            </label>
            <div className="experience-editor">
              <div className="experience-heading">
                <label>
                  Kinh nghiệm làm việc
                  <span className="field-hint">
                    Thêm từng công việc riêng biệt
                  </span>
                </label>
                <button type="button" onClick={addExperience}>
                  + Thêm công việc
                </button>
              </div>
              {experienceItems.map((item, index) => (
                <div className="experience-item" key={`experience-${index}`}>
                  <div className="experience-item-heading">
                    <strong>Công việc {index + 1}</strong>
                    {experienceItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <textarea
                    rows="5"
                    value={item}
                    onInput={(event) => {
                      const nextItems = [...experienceItems];
                      nextItems[index] = event.target.value;
                      updateExperienceItems(nextItems);
                    }}
                    placeholder="Chức danh | Công ty | Thời gian\nMô tả công việc, thành tích..."
                  />
                </div>
              ))}
            </div>
            <label>
              Học vấn
              <textarea
                name="education"
                rows="5"
                value={data.education}
                onInput={updateField}
              />
            </label>
            {data.originalCvText && (
              <div className="original-cv-import">
                <h3>Nội dung đầy đủ từ CV gốc</h3>
                <p>
                  Toàn bộ nội dung trích xuất được giữ trong bản nháp để bạn đối
                  chiếu, kể cả phần AI chưa phân loại vào các mục phía trên.
                </p>
                <label>
                  Văn bản gốc đã nhập
                  <textarea
                    name="originalCvText"
                    rows="10"
                    value={data.originalCvText}
                    onInput={updateField}
                  />
                </label>
                <label className="include-original-toggle">
                  <input
                    type="checkbox"
                    checked={data.includeOriginalCvText}
                    onChange={(event) => {
                      setData((current) => ({
                        ...current,
                        includeOriginalCvText: event.target.checked,
                      }));
                      setSaved(false);
                    }}
                  />
                  Đưa cả nội dung gốc vào PDF
                </label>
              </div>
            )}
          </div>
        </section>

        <section className={`cv-preview ${template}`} aria-label="Xem trước CV">
          <div className="cv-paper" ref={previewRef}>
            {template === "sidebar" ? (
              <div className="sidebar-template">
                <aside className="sidebar-column">
                  <div className="sidebar-avatar" aria-hidden="true">
                    {(data.fullName || "CV").charAt(0)}
                  </div>
                  <h2>{data.fullName || "Họ và tên"}</h2>
                  <p className="sidebar-title">
                    {data.title || "Vị trí ứng tuyển"}
                  </p>

                  <div className="sidebar-section">
                    <h3>Liên hệ</h3>
                    <span>{data.phone}</span>
                    <span>{data.email}</span>
                    <span>{data.location}</span>
                  </div>
                  <div className="sidebar-section">
                    <h3>Kỹ năng</h3>
                    <ul>
                      {lines(data.skills).map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="sidebar-section">
                    <h3>Học vấn</h3>
                    {lines(data.education).map((line, index) => (
                      <p key={`${line}-${index}`}>{line}</p>
                    ))}
                  </div>
                </aside>

                <div className="sidebar-main">
                  <section>
                    <h3>Giới thiệu</h3>
                    <p>{data.summary}</p>
                  </section>
                  <section>
                    <h3>Kinh nghiệm làm việc</h3>
                    {data.experience.split("\n\n").map((item, index) => (
                      <div className="cv-entry" key={`${item}-${index}`}>
                        {lines(item).map((line, lineIndex) => (
                          <p
                            className={lineIndex === 0 ? "entry-title" : ""}
                            key={`${line}-${lineIndex}`}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </section>
                  {data.includeOriginalCvText && data.originalCvText && (
                    <section className="original-cv-source">
                      <h3>Nội dung bổ sung từ CV gốc</h3>
                      <p>{data.originalCvText}</p>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <>
                <header className="cv-paper-header">
                  <div>
                    <h2>{data.fullName || "Họ và tên"}</h2>
                    <p>{data.title || "Vị trí ứng tuyển"}</p>
                  </div>
                  <div className="contact-list">
                    <span>{data.email}</span>
                    <span>{data.phone}</span>
                    <span>{data.location}</span>
                  </div>
                </header>

                <div className="cv-paper-body">
                  <section>
                    <h3>Giới thiệu</h3>
                    <p>{data.summary}</p>
                  </section>
                  <section>
                    <h3>Kinh nghiệm</h3>
                    {data.experience.split("\n\n").map((item, index) => (
                      <div className="cv-entry" key={`${item}-${index}`}>
                        {lines(item).map((line, lineIndex) => (
                          <p
                            className={lineIndex === 0 ? "entry-title" : ""}
                            key={`${line}-${lineIndex}`}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </section>
                  <section>
                    <h3>Học vấn</h3>
                    {lines(data.education).map((line, index) => (
                      <p
                        className={index === 0 ? "entry-title" : ""}
                        key={`${line}-${index}`}
                      >
                        {line}
                      </p>
                    ))}
                  </section>
                  <section>
                    <h3>Kỹ năng</h3>
                    <div className="skill-list">
                      {lines(data.skills).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </section>
                  {data.includeOriginalCvText && data.originalCvText && (
                    <section className="original-cv-source">
                      <h3>Nội dung bổ sung từ CV gốc</h3>
                      <p>{data.originalCvText}</p>
                    </section>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default CreateCV;
