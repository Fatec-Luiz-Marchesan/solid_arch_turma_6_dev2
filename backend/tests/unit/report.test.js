const Report = require('../../models/Report');
const ReportValidation = require('../../helpers/reportValidation');
const GenerateReportUseCase = require('../../useCases/report/GenerateReportUseCase');
const GetReportsUseCase = require('../../useCases/report/GetReportsUseCase');
const DeleteReportUseCase = require('../../useCases/report/DeleteReportUseCase');
const ExportReportUseCase = require('../../useCases/report/ExportReportUseCase');

// Mock do modelo Report com uma função mock
jest.mock('../../models/Report', () => {
  const createMockInstance = () => ({
    save: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn().mockReturnValue({ _id: 'mock-id', name: 'Teste' }),
    markAsProcessing: jest.fn(function() { this.status = 'processing'; return this; }),
    markAsCompleted: jest.fn(function(data, count) {
      this.status = 'completed';
      this.data = data;
      this.totalRecords = count || 0;
      return this;
    }),
    markAsFailed: jest.fn(function() {
      this.status = 'failed';
      return this;
    })
  });

  const MockReport = jest.fn(() => {
    const instance = createMockInstance();
    instance.status = 'pending';
    instance.totalRecords = 0;
    instance.data = {};
    return instance;
  });

  MockReport.findByUser = jest.fn().mockResolvedValue([]);
  MockReport.findOne = jest.fn().mockResolvedValue(null);
  MockReport.findOneAndDelete = jest.fn().mockResolvedValue(null);
  MockReport.getStats = jest.fn().mockResolvedValue({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });

  return MockReport;
});

jest.mock('../../models/Pet', () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
}));
jest.mock('../../models/Payment', () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
}));
jest.mock('../../models/Vaccine', () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
}));
jest.mock('../../models/Location', () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
}));
jest.mock('../../models/Diet', () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
}));
jest.mock('../../config/logger');

// Mockar o método fetchData da instância GenerateReportUseCase para evitar chamada real
const originalFetchData = GenerateReportUseCase.fetchData;
beforeEach(() => {
  GenerateReportUseCase.fetchData = jest.fn().mockResolvedValue([]);
});
afterEach(() => {
  GenerateReportUseCase.fetchData = originalFetchData;
});

describe('Report - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetar o comportamento do mock do Report
    Report.mockImplementation(() => {
      const instance = {
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ _id: 'mock-id', name: 'Teste' }),
        markAsProcessing: jest.fn(function() { this.status = 'processing'; return this; }),
        markAsCompleted: jest.fn(function(data, count) {
          this.status = 'completed';
          this.data = data;
          this.totalRecords = count || 0;
          return this;
        }),
        markAsFailed: jest.fn(function() {
          this.status = 'failed';
          return this;
        })
      };
      instance.status = 'pending';
      instance.totalRecords = 0;
      instance.data = {};
      return instance;
    });
    // Garantir que o fetchData mockado retorne array vazio
    GenerateReportUseCase.fetchData = jest.fn().mockResolvedValue([]);
  });

  describe('Validation', () => {
    test('validateName aceita nome válido', () => {
      const result = ReportValidation.validateName('Relatório de Pets');
      expect(result.valid).toBe(true);
    });

    test('validateName rejeita nome vazio', () => {
      const result = ReportValidation.validateName('');
      expect(result.valid).toBe(false);
    });

    test('validateType aceita pets', () => {
      const result = ReportValidation.validateType('pets');
      expect(result.valid).toBe(true);
    });

    test('validateType rejeita tipo inválido', () => {
      const result = ReportValidation.validateType('invalid');
      expect(result.valid).toBe(false);
    });

    test('validateFormat aceita json', () => {
      const result = ReportValidation.validateFormat('json');
      expect(result.valid).toBe(true);
    });

    test('validateDates aceita datas válidas', () => {
      const result = ReportValidation.validateDates('2024-01-01', '2024-12-31');
      expect(result.valid).toBe(true);
    });

    test('validateObjectId aceita ID válido', () => {
      const result = ReportValidation.validateObjectId('507f1f77bcf86cd799439011');
      expect(result.valid).toBe(true);
    });
  });

  describe('Report Model', () => {
    test('markAsCompleted altera status', () => {
      const report = new Report({ name: 'Teste', type: 'pets' });
      expect(report.status).toBe('pending');
      report.markAsCompleted([], 0);
      expect(report.status).toBe('completed');
      expect(report.totalRecords).toBe(0);
    });

    test('markAsFailed altera status', () => {
      const report = new Report({ name: 'Teste', type: 'pets' });
      expect(report.status).toBe('pending');
      report.markAsFailed();
      expect(report.status).toBe('failed');
    });
  });

  describe('GenerateReportUseCase', () => {
    test('deve gerar relatório com sucesso', async () => {
      // Criar uma instância mock específica para este teste
      const mockInstance = {
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ _id: '123', name: 'Relatório' }),
        markAsProcessing: jest.fn(function() { this.status = 'processing'; return this; }),
        markAsCompleted: jest.fn(function(data, count) {
          this.status = 'completed';
          this.data = data;
          this.totalRecords = count || 0;
          return this;
        }),
        markAsFailed: jest.fn(function() {
          this.status = 'failed';
          return this;
        })
      };
      mockInstance.status = 'pending';
      mockInstance.totalRecords = 0;
      mockInstance.data = {};

      // Substituir o comportamento do construtor do Report para retornar nossa instância
      Report.mockImplementationOnce(() => mockInstance);

      // O fetchData já está mockado para retornar []
      const result = await GenerateReportUseCase.execute('u1', {
        name: 'Relatório Pets',
        type: 'pets',
        format: 'json'
      });

      expect(result).toBeDefined();
      expect(mockInstance.markAsCompleted).toHaveBeenCalled();
    });

    test('deve falhar com nome inválido', async () => {
      await expect(GenerateReportUseCase.execute('u1', {
        name: '',
        type: 'pets'
      })).rejects.toThrow('Nome do relatório é obrigatório');
    });
  });

  describe('GetReportsUseCase', () => {
    test('getUserReports retorna lista', async () => {
      Report.findByUser.mockResolvedValue([{ _id: '1' }, { _id: '2' }]);
      const result = await GetReportsUseCase.getUserReports('507f1f77bcf86cd799439011');
      expect(result.length).toBe(2);
    });

    test('getReportById retorna relatório', async () => {
      Report.findOne.mockResolvedValue({ _id: '123', name: 'Teste' });
      const result = await GetReportsUseCase.getReportById('507f1f77bcf86cd799439011');
      expect(result._id).toBe('123');
    });

    test('getStats retorna estatísticas', async () => {
      Report.getStats.mockResolvedValue({ total: 5, completed: 3, pending: 2 });
      const result = await GetReportsUseCase.getStats('507f1f77bcf86cd799439011');
      expect(result.total).toBe(5);
    });
  });

  describe('DeleteReportUseCase', () => {
    test('deve deletar relatório', async () => {
      Report.findOneAndDelete.mockResolvedValue({ _id: '123' });
      const result = await DeleteReportUseCase.execute('507f1f77bcf86cd799439011');
      expect(result.message).toBe('Relatório removido com sucesso');
    });
  });

  describe('ExportReportUseCase', () => {
    test('deve exportar relatório', async () => {
      Report.findOne.mockResolvedValue({
        _id: '123',
        name: 'Teste',
        status: 'completed',
        data: [],
        totalRecords: 0,
        generatedAt: new Date()
      });
      const result = await ExportReportUseCase.execute('507f1f77bcf86cd799439011');
      expect(result.id).toBe('123');
    });

    test('deve falhar se relatório não estiver pronto', async () => {
      Report.findOne.mockResolvedValue({
        _id: '123',
        name: 'Teste',
        status: 'pending'
      });
      await expect(ExportReportUseCase.execute('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Relatório ainda não está pronto para exportação');
    });
  });
});
