import { PackageResponseDTO } from '@application/dtos/PackageDTO';
import { IBanner } from '@domain/entities/IBanner';
import { IPackageFilter } from '@domain/entities/IPackageFilter';
import { IPackageQueryOptions } from '@domain/entities/IPackageQueryOptions';
import { IPaginatedResult } from '@domain/entities/IPaginatedResult';

export interface IHomeUseCases {
  getHome(): Promise<{
    banners: IBanner[];
    packages: PackageResponseDTO[];
  }>;

  getActivePackage(page: number,limit:number,filter?:IPackageFilter): Promise<
    IPaginatedResult<PackageResponseDTO>
  >;

  getPackageById(id: string): Promise<PackageResponseDTO | null>;
}
