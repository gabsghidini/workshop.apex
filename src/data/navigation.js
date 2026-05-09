// src/data/navigation.js
export const NAV = [
  {
    id: 'home',
    label: 'Visão Geral',
    path: '/workshop',
    icon: '⌂',
  },
  {
    id: 'dia1',
    label: 'DIA 1 — Arquitetura Comercial',
    type: 'section-header',
    children: [
      { id: 'mod1', label: 'Diagnóstico Comercial', path: '/workshop/mod/mod1', tag: 'Módulo 1', file: 'mod1' },
      { id: 'mod2', label: 'ICP e Qualificação', path: '/workshop/mod/mod2', tag: 'Módulo 2', file: 'mod2' },
      { id: 'mod3', label: 'Oferta e Mecanismo Único', path: '/workshop/mod/mod3', tag: 'Módulo 3', file: 'mod3' },
      { id: 'mod4', label: 'Demanda, Canais e Ângulos', path: '/workshop/mod/mod4', tag: 'Módulo 4', file: 'mod4' },
    ],
  },
  {
    id: 'dia2',
    label: 'DIA 2 — Operação Comercial',
    type: 'section-header',
    children: [
      { id: 'mod5', label: 'Operação, CRM e Follow-up', path: '/workshop/mod/mod5', tag: 'Módulo 5', file: 'mod5' },
      { id: 'mod6', label: 'Plano de Execução 30 Dias', path: '/workshop/mod/mod6', tag: 'Módulo 6', file: 'mod6' },
    ],
  },
  {
    id: 'materiais',
    label: 'MATERIAIS',
    type: 'section-header',
    children: [
      {
        id: 'mat-mod1', label: 'Módulo 1', type: 'group', children: [
          { id: 'mat1_vazamento', label: 'Mapa de Vazamento', path: '/workshop/mod/mat1_vazamento', tag: 'Material', file: 'mat1_vazamento', type: 'material' },
          { id: 'mat1_gargalos', label: 'Matriz de Gargalos', path: '/workshop/mod/mat1_gargalos', tag: 'Material', file: 'mat1_gargalos', type: 'material' },
          { id: 'mat1_clientes', label: 'Mapa Melhores Clientes', path: '/workshop/mod/mat1_clientes', tag: 'Material', file: 'mat1_clientes', type: 'material' },
        ]
      },
      {
        id: 'mat-mod2', label: 'Módulo 2', type: 'group', children: [
          { id: 'mat2_icp', label: 'Mapa de ICP', path: '/workshop/mod/mat2_icp', tag: 'Material', file: 'mat2_icp', type: 'material' },
          { id: 'mat2_fit', label: 'Checklist de Fit', path: '/workshop/mod/mat2_fit', tag: 'Material', file: 'mat2_fit', type: 'material' },
          { id: 'mat2_bant', label: 'Roteiro BANT', path: '/workshop/mod/mat2_bant', tag: 'Material', file: 'mat2_bant', type: 'material' },
        ]
      },
      {
        id: 'mat-mod3', label: 'Módulo 3', type: 'group', children: [
          { id: 'mat3_gso', label: 'Grand Slam Offer', path: '/workshop/mod/mat3_gso', tag: 'Material', file: 'mat3_gso', type: 'material' },
          { id: 'mat3_mecanismo', label: 'Mecanismo Único', path: '/workshop/mod/mat3_mecanismo', tag: 'Material', file: 'mat3_mecanismo', type: 'material' },
          { id: 'mat3_posicionamento', label: 'Frase de Posicionamento', path: '/workshop/mod/mat3_posicionamento', tag: 'Material', file: 'mat3_posicionamento', type: 'material' },
        ]
      },
      {
        id: 'mat-mod4', label: 'Módulo 4', type: 'group', children: [
          { id: 'mat4_canais', label: 'Canais Prioritários', path: '/workshop/mod/mat4_canais', tag: 'Material', file: 'mat4_canais', type: 'material' },
          { id: 'mat4_angulos', label: 'Ângulos Comerciais', path: '/workshop/mod/mat4_angulos', tag: 'Material', file: 'mat4_angulos', type: 'material' },
          { id: 'mat4_mensagem', label: 'Mensagem Inicial', path: '/workshop/mod/mat4_mensagem', tag: 'Material', file: 'mat4_mensagem', type: 'material' },
        ]
      },
      {
        id: 'mat-mod5', label: 'Módulo 5', type: 'group', children: [
          { id: 'mat5_crm', label: 'Estrutura CRM e Pipeline', path: '/workshop/mod/mat5_crm', tag: 'Material', file: 'mat5_crm', type: 'material' },
          { id: 'mat5_r1', label: 'Roteiro R1 Consultiva', path: '/workshop/mod/mat5_r1', tag: 'Material', file: 'mat5_r1', type: 'material' },
          { id: 'mat5_8x8', label: 'Checklist Proposta 8x8', path: '/workshop/mod/mat5_8x8', tag: 'Material', file: 'mat5_8x8', type: 'material' },
        ]
      },
      {
        id: 'mat-mod6', label: 'Módulo 6', type: 'group', children: [
          { id: 'mat6_plano', label: 'Plano 30 Dias', path: '/workshop/mod/mat6_plano', tag: 'Material', file: 'mat6_plano', type: 'material' },
          { id: 'mat6_checklist', label: 'Checklist Semanal', path: '/workshop/mod/mat6_checklist', tag: 'Material', file: 'mat6_checklist', type: 'material' },
          { id: 'mat6_maturidade', label: 'Diagnóstico de Maturidade', path: '/workshop/mod/mat6_maturidade', tag: 'Material', file: 'mat6_maturidade', type: 'material' },
        ]
      },
    ],
  },
]

// flat map of all content items by id
export function getAllItems() {
  const items = {}
  function walk(nodes) {
    for (const node of nodes) {
      if (node.file) items[node.id] = node
      if (node.children) walk(node.children)
    }
  }
  walk(NAV)
  return items
}
