"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function CopyTradingPage() {
  const [activeTab, setActiveTab] = useState("copy")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-[#131722] text-white">
      {/* Navigation Tabs */}
      <div className="page__content-header">
        <div className="page__content-nav tabs tabs--collapse-md bg-[#1e2329] border-b border-[#2b3040]">
          <nav className="tabs__bar flex">
            <a
              href="/deposit"
              className="tabs__tab px-6 py-4 text-[#9ca3af] hover:text-white border-b-2 border-transparent hover:border-[#3b82f6]"
            >
              Depósito
            </a>
            <a
              href="#"
              className="tabs__tab px-6 py-4 text-[#9ca3af] hover:text-white border-b-2 border-transparent hover:border-[#3b82f6]"
            >
              Retirada
            </a>
            <a
              href="#"
              className="tabs__tab px-6 py-4 text-[#9ca3af] hover:text-white border-b-2 border-transparent hover:border-[#3b82f6]"
            >
              Transações
            </a>
            <a
              href="#"
              className="tabs__tab px-6 py-4 text-[#9ca3af] hover:text-white border-b-2 border-transparent hover:border-[#3b82f6]"
            >
              Operações
            </a>
            <a
              href="#"
              className="tabs__tab px-6 py-4 text-[#9ca3af] hover:text-white border-b-2 border-transparent hover:border-[#3b82f6]"
            >
              Perfil
            </a>
            <a
              href="#"
              className="tabs__tab px-6 py-4 text-[#9ca3af] hover:text-white border-b-2 border-transparent hover:border-[#3b82f6]"
            >
              Torneio
            </a>
            <a href="/copy" className="tabs__tab active px-6 py-4 text-white border-b-2 border-[#3b82f6]">
              Copy
            </a>
          </nav>
        </div>
      </div>

      {/* Copy Trading Content */}
      <div className="container-affiliate p-6">
        <div className="v-application v-theme--dark">
          {/* Sub Tabs */}
          <div className="v-slide-group v-tabs mb-6">
            <div className="v-slide-group__container">
              <div className="v-slide-group__content flex space-x-4">
                <button
                  onClick={() => setActiveTab("copy")}
                  className={`v-btn v-tab px-6 py-3 rounded ${
                    activeTab === "copy"
                      ? "v-tab--selected bg-[#3b82f6] text-white"
                      : "text-[#9ca3af] hover:text-white hover:bg-[#2b3040]"
                  }`}
                >
                  Copy Trader
                </button>
                <button
                  onClick={() => setActiveTab("my_copys")}
                  className={`v-btn v-tab px-6 py-3 rounded ${
                    activeTab === "my_copys"
                      ? "v-tab--selected bg-[#3b82f6] text-white"
                      : "text-[#9ca3af] hover:text-white hover:bg-[#2b3040]"
                  }`}
                >
                  Meus copys
                </button>
              </div>
            </div>
          </div>

          {/* Content Window */}
          <div className="v-window">
            {activeTab === "copy" && (
              <div className="v-window-item v-window-item--active">
                <div className="v-row">
                  <div className="v-col-md-6 v-col">
                    <div className="v-card bg-[#1e2329] rounded-lg border border-[#2b3040]">
                      {/* Card Header */}
                      <div className="v-card-title p-4 border-b border-[#2b3040] flex items-center justify-between">
                        <h3 className="text-white font-medium">Traders</h3>
                        <div className="v-input v-text-field relative">
                          <div className="v-field bg-[#2b3040] rounded flex items-center">
                            <div className="v-field__prepend-inner p-3">
                              <Search className="h-4 w-4 text-[#9ca3af]" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="v-field__input bg-transparent border-0 text-white py-3 px-2 flex-1 focus:outline-none placeholder-[#9ca3af]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="v-table">
                        <div className="v-table__wrapper">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#2b3040]">
                                <th className="v-data-table__th text-left p-4 text-[#9ca3af] font-medium">Nome</th>
                                <th className="v-data-table__th text-left p-4 text-[#9ca3af] font-medium">Ganho</th>
                                <th className="v-data-table__th text-left p-4 text-[#9ca3af] font-medium">
                                  Seguidores
                                </th>
                                <th className="v-data-table__th text-left p-4 text-[#9ca3af] font-medium">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="v-data-table-rows-no-data">
                                <td colSpan={4} className="text-center p-8 text-[#9ca3af]">
                                  No data available
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Footer */}
                        <div className="v-data-table-footer border-t border-[#2b3040] p-4 flex items-center justify-between">
                          <div className="v-data-table-footer__items-per-page flex items-center space-x-2">
                            <span className="text-[#9ca3af] text-sm">Items per page:</span>
                            <select className="bg-[#2b3040] border border-[#374151] rounded px-2 py-1 text-white text-sm">
                              <option value="10">10</option>
                              <option value="25">25</option>
                              <option value="50">50</option>
                            </select>
                          </div>
                          <div className="v-data-table-footer__info text-[#9ca3af] text-sm">0-0 of 0</div>
                          <div className="v-data-table-footer__pagination flex items-center space-x-1">
                            <button className="v-btn v-btn--disabled p-2 text-[#6b7280]" disabled>
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button className="v-btn v-btn--disabled p-2 text-[#6b7280]" disabled>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="v-col-md-6 v-col">
                    <div className="v-card bg-[#1e2329] rounded-lg border border-[#2b3040] h-64">
                      {/* Empty right panel */}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "my_copys" && (
              <div className="v-window-item v-window-item--active">
                <div className="text-center p-8 text-[#9ca3af]">
                  <p>Meus copys content will be displayed here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
