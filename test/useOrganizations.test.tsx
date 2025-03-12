
import { renderHook, act } from '@testing-library/react-hooks';
import supabase from '../../../lib/supabase';
import useOrganizations from '../hooks/useOrganizations';
import { OrganizationsResponse } from '../types/organizations';

// Mock de Supabase
jest.mock('../../../lib/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn(),
    select: jest.fn().mockReturnThis(),
  })),
}));

// Mock del errorManager
jest.mock('../errorManager/errorManager', () => (error: any) => ({
  error: true,
  message: error.message,
  data: null,
}));

const mockOrganization = {
  id: 'org-123',
  name: 'Test Org',
  description: 'Test Description',
  slug: 'test-org',
  open: true,
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

describe('useOrganizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test para getOrganizations
  describe('getOrganizations', () => {
    it('should fetch organizations successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: [mockOrganization],
          error: null,
          count: 1,
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.getOrganizations(1, 10, '');

      expect(response.error).toBe(false);
      expect(response.data).toEqual([mockOrganization]);
    });

    it('should filter by user ID', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        contains: jest.fn().mockResolvedValueOnce({
          data: [mockOrganization],
          error: null,
          count: 1,
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.getOrganizations(1, 10, '', 'user-123');

      expect(supabase.from).toHaveBeenCalledWith('organizations');
      expect(response.data).toEqual([mockOrganization]);
    });
  });

  // Test para createOrganization
  describe('createOrganization', () => {
    it('should create a new organization', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce({
          data: [mockOrganization],
          error: null,
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.createOrganization(
        'Test Org',
        'Test Description',
        'test-org'
      );

      expect(response.error).toBe(false);
      expect(response.data).toEqual([mockOrganization]);
    });
  });

  // Test para deleteOrganization
  describe('deleteOrganization', () => {
    it('should delete an organization', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          error: null,
          data: {},
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.deleteOrganization('org-123');

      expect(response.error).toBe(false);
    });
  });

  // Test para updateOrganization
  describe('updateOrganization', () => {
    it('should update organization data', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce({
          data: [mockOrganization],
          error: null,
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.updateOrganization('org-123', {
        name: 'Updated Name',
      });

      expect(response.error).toBe(false);
      expect(response.data).toEqual([mockOrganization]);
    });
  });

  // Test para getUserRolls
  describe('getUserRolls', () => {
    it('should fetch user rolls', async () => {
      const mockRolls = [{ id: 'roll-123', name: 'Admin' }];

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: mockRolls,
          error: null,
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.getUserRolls();

      expect(response.error).toBe(false);
      expect(response.data).toEqual(mockRolls);
    });
  });

  // Test para joinOrganization
  describe('joinOrganization', () => {
    it('should add user to organization', async () => {
      const mockMembership = {
        user_id: 'user-123',
        organization_id: 'org-123',
        roll_id: 'roll-123',
      };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce({
          data: [mockMembership],
          error: null,
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.joinOrganization(
        'user-123',
        'org-123',
        'roll-123'
      );

      expect(response.error).toBe(false);
      expect(response.data).toEqual([mockMembership]);
    });
  });

  // Test para leaveOrganization
  describe('leaveOrganization', () => {
    it('should remove user from organization', async () => {
      const mockMembership = {
        user_id: 'user-123',
        organization_id: 'org-123',
      };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce({
          data: [mockMembership],
          error: null,
        }),
      });

      const { result } = renderHook(() => useOrganizations());
      const response = await result.current.leaveOrganization(
        'user-123',
        'org-123'
      );

      expect(response.error).toBe(false);
      expect(response.data).toEqual([mockMembership]);
    });
  });
});