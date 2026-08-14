"use client";

import { useEffect, useState } from "react";
import { Meilisearch } from "meilisearch";
import { ChevronDown, ChevronUp, Loader2, AlertCircle, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";

// Biến môi trường
const API_CONFIG_URL =
  process.env.NEXT_PUBLIC_API_CONFIG_URL || "tu_lam_ban_dau_config.json";
const DEFAULT_INDEX_NAME =
  process.env.NEXT_PUBLIC_DEFAULT_INDEX_NAME || "epu_smart_lookup";

interface Student {
  id: string;
  student_code: string;
  full_name: string;
  class_name: string;
  major_name?: string;
  faculty_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  academic_year?: string;
  status?: string;
}

// Sub-component Avatar với xử lý Error Fallback
function StudentAvatar({
  avatarUrl,
  fullName,
  getInitials,
}: {
  avatarUrl?: string;
  fullName: string;
  getInitials: (name?: string) => string;
}) {
  const [imgError, setImgError] = useState(false);

  if (!avatarUrl || imgError) {
    return (
      <div className="w-9 h-9 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm uppercase select-none">
        {getInitials(fullName)}
      </div>
    );
  }

  return (
    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
      <Image
        src={avatarUrl}
        alt={fullName}
        fill
        className="object-cover"
        sizes="36px"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

// Sub-component Skeleton Loading
function StudentSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700/60 shadow-sm animate-pulse">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1">
          {/* Skeleton Circle Avatar */}
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
          {/* Skeleton Lines Name & Code */}
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
          </div>
        </div>
        {/* Skeleton Button Detail */}
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12" />
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<Meilisearch | null>(null);
  const [indexName, setIndexName] = useState<string>(DEFAULT_INDEX_NAME);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Khởi tạo Meilisearch từ Backend
  useEffect(() => {
    async function initMeilisearch() {
      try {
        const res = await fetch(API_CONFIG_URL);
        if (!res.ok) throw new Error(`Lỗi kết nối API Config (${res.status})`);

        const data = await res.json();
        const host = data.host;
        const apiKey = data.searchKey;
        const targetIndex = data.indexName || DEFAULT_INDEX_NAME;

        if (!host || !apiKey) {
          throw new Error("Dữ liệu cấu hình API trả về không đầy đủ.");
        }

        const msClient = new Meilisearch({ host, apiKey });
        setClient(msClient);
        setIndexName(targetIndex);
      } catch (err: any) {
        console.error(err);
        setError("Không thể khởi tạo cấu hình tra cứu.");
      }
    }

    initMeilisearch();
  }, []);

  // Xử lý truy vấn tìm kiếm
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (!client) return;

    // Đánh dấu loading ngay lập tức khi user gõ phím
    setLoading(true);

    const search = async () => {
      try {
        const index = client.index(indexName);
        const searchRes = await index.search(query, { limit: 30 });
        setResults(searchRes.hits as Student[]);
      } catch (err) {
        console.error("Lỗi truy vấn:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 150);
    return () => clearTimeout(timeoutId);
  }, [query, client, indexName]);

  const getInitials = (fullName?: string) => {
    if (!fullName) return "SV";
    const words = fullName.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    const firstInitial = words[0].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);
    return `${lastInitial}${firstInitial}`.toUpperCase();
  };

  const toggleExpand = (id: string) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Spacer đỉnh giúp đẩy Card lên trên */}
      <div className="pt-2 sm:pt-6 flex-1 flex items-center justify-center">
        {/* Container chính */}
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-110 border border-slate-200 dark:border-slate-800">

          {/* ================= CỘT TRÁI (KẾT QUẢ / BANNER) ================= */}
          <div className="md:col-span-6 lg:col-span-7 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">

            {query.trim() === "" ? (
              /* TRẠNG THÁI CHƯA TÌM KIẾM: Banner Logo */
              <div className="w-full h-full min-h-65 md:min-h-full relative flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-left.svg"
                  alt="EPU Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              /* TRẠNG THÁI ĐÃ TÌM KIẾM: Danh sách kết quả */
              <div className="p-4 sm:p-5 flex-1 flex flex-col h-full max-h-120">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-between">
                  <span>
                    {loading
                      ? "Đang tìm kiếm..."
                      : `Sinh viên (${results.length})`}
                  </span>
                  {loading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  )}
                </h2>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {/* TRẠNG THÁI LOADING: Hiển thị Skeleton */}
                  {loading ? (
                    <>
                      <StudentSkeleton />
                      <StudentSkeleton />
                      <StudentSkeleton />
                      <StudentSkeleton />
                    </>
                  ) : results.length > 0 ? (
                    /* CÓ KẾT QUẢ */
                    results.map((student) => {
                      const isExpanded =
                        expandedStudentId ===
                        (student.id || student.student_code);
                      return (
                        <div
                          key={student.id || student.student_code}
                          className="bg-white dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all hover:border-blue-300 dark:hover:border-blue-500"
                        >
                          <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <StudentAvatar
                                avatarUrl={student.avatar_url}
                                fullName={student.full_name}
                                getInitials={getInitials}
                              />

                              <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                                  {student.full_name}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                  {student.student_code}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                toggleExpand(
                                  student.id || student.student_code
                                )
                              }
                              className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5"
                            >
                              Chi tiết{" "}
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 animate-fadeIn">
                              <p><span className="text-slate-400">Lớp:</span> <strong>{student.class_name}</strong></p>
                              {student.major_name && <p><span className="text-slate-400">Ngành:</span> <strong>{student.major_name}</strong></p>}
                              {student.faculty_name && <p><span className="text-slate-400">Khoa:</span> <strong>{student.faculty_name}</strong></p>}
                              {student.date_of_birth && <p><span className="text-slate-400">Ngày sinh:</span> <strong>{student.date_of_birth}</strong></p>}

                              {/* Hiển thị Trạng thái */}
                              {student.status && (
                                <p className="flex items-center gap-1.5 pt-1">
                                  <span className="text-slate-400">Trạng thái:</span>
                                  {(() => {
                                    const statusLower = student.status.toLowerCase();

                                    // 1. Đã tốt nghiệp (Graduated) -> Màu xanh lá (Emerald)
                                    if (statusLower === "graduated") {
                                      return (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                          Đã tốt nghiệp
                                        </span>
                                      );
                                    }

                                    // 2. Đang học (Studying) -> Màu xanh dương (Blue)
                                    if (statusLower === "studying") {
                                      return (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                          Đang học
                                        </span>
                                      );
                                    }

                                    // 3. Trạng thái khác (Fallback) -> Màu xám (Slate)
                                    return (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        {student.status}
                                      </span>
                                    );
                                  })()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* KHÔNG CÓ KẾT QUẢ */
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Không tìm thấy sinh viên nào
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ================= CỘT PHẢI (TRA CỨU) ================= */}
          <div className="md:col-span-6 lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center items-center bg-white dark:bg-slate-900">
            <div className="w-full space-y-5 my-auto">
              {/* Header */}
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">
                  EPU Smart Lookup
                </h1>
                <p className="text-[11px] italic text-slate-400 dark:text-slate-500">
                  Verify faster — Trust smarter
                </p>
              </div>

              {/* Báo lỗi */}
              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px] rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Form Input Tra Cứu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Tra cứu thông tin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="Nhập MSV hoặc tên của sinh viên..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Chú thích thông tin */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Hệ thống tra cứu xác thực thông tin sinh viên và văn bằng chính thức của EPU.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[11px] text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto w-full">
        <div>
          © {new Date().getFullYear()} <strong>EPU Smart Lookup</strong>. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">
            Điều khoản sử dụng
          </a>
          <span>•</span>
          <a href="#" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">
            Chính sách bảo mật
          </a>
          <span>•</span>
          <a href="#" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">
            Hỗ trợ
          </a>
        </div>
      </footer>
    </main>
  );
}