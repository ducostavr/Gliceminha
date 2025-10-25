// Arquivo: src/components/ReportPDF.tsx

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Define os tipos de dados que o PDF receberá
interface GlucoseRecord {
  glucose_level: number;
  insulin_units: number | null;
  hba1c: number | null;
  note: string | null;
  created_at: string;
}

interface ReportPDFProps {
  patientName: string;
  startDate: string;
  endDate: string;
  records: GlucoseRecord[];
}

// Criação dos estilos para o PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10, 
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    lineHeight: 1.4,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Helvetica-Bold',
  },
  header: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    color: 'grey',
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
  },
  // Container principal para as duas colunas
  twoColumnContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: 5,
  },
  // Estilo para cada coluna
  column: {
    width: '50%',
    padding: '0 5px',
  },
  recordContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
    marginBottom: 5,
    // Garante que um registro não quebre entre páginas
    breakInside: 'avoid', 
  },
  recordText: {
    fontSize: 10,
  },
  recordDate: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
});

export const ReportPDF = ({ patientName, startDate, endDate, records }: ReportPDFProps) => {
  // Cálculos para o resumo
  const totalApplications = records.length;
  const totalInsulin = records.reduce((sum, record) => sum + (record.insulin_units || 0), 0);
  const averageInsulin = totalApplications > 0 ? (totalInsulin / totalApplications).toFixed(1) : '0';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }
  
  // ✅ AQUI ESTÁ A LÓGICA CORRETA:
  // 1. Divide os registros em duas metades exatas
  const midpoint = Math.ceil(records.length / 2);
  const leftColumnRecords = records.slice(0, midpoint);
  const rightColumnRecords = records.slice(midpoint);

  // Função para renderizar um único registro
  const renderRecord = (record: GlucoseRecord, index: number) => {
    const date = new Date(record.created_at);
    // Usamos o ID do registro (created_at) como chave para garantir unicidade
    return (
      <View key={record.created_at + index} style={styles.recordContainer}>
        <Text style={styles.recordDate}>
          {/* A numeração é o índice + 1 */}
          {index + 1}. {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.recordText}>   - Glicose: {record.glucose_level} mg/dL</Text>
        <Text style={styles.recordText}>
          {'   - Insulina: '}
          {record.insulin_units !== null ? `${record.insulin_units} unidades` : 'N/A'}
        </Text>
        {record.note && <Text style={styles.recordText}>   - Observação: "{record.note}"</Text>}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório de Insulina</Text>
        <Text style={styles.header}>Paciente: {patientName}</Text>
        <Text style={styles.header}>Período: {formatDate(startDate)} a {formatDate(endDate)}</Text>

        <Text style={styles.sectionTitle}>Resumo</Text>
        <Text>- Total de aplicações: {totalApplications}</Text>
        <Text>- Total de insulina: {totalInsulin.toFixed(1)} unidades</Text>
        <Text>- Média por aplicação: {averageInsulin} unidades</Text>

        <Text style={styles.sectionTitle}>Detalhes das Aplicações</Text>
        
        {/* ✅ LÓGICA DE RENDERIZAÇÃO CORRETA: */}
        <View style={styles.twoColumnContainer}>
          
          {/* 1. Renderiza a Coluna da Esquerda (itens 1-24) PRIMEIRO */}
          <View style={styles.column}>
            {leftColumnRecords.map((record, index) => renderRecord(record, index))}
          </View>

          {/* 2. Renderiza a Coluna da Direita (itens 25-48) DEPOIS */}
          <View style={styles.column}>
            {rightColumnRecords.map((record, index) => 
              // A numeração continua de onde a primeira coluna parou
              renderRecord(record, index + midpoint)
            )}
          </View>
        </View>
        
      </Page>
    </Document>
  );
};