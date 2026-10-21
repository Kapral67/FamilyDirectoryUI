export type PhoneType = 'MOBILE' | 'LANDLINE';

export interface Member {
    id: string;
    familyId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: 'Jr' | 'Sr';
    birthday: string;
    deathday?: string;
    email?: string;
    phones?: Partial<Record<PhoneType, string>>;
    address?: string[];
}

export interface Family {
    id: string;
    ancestor: string;
    spouse?: string;
    descendants?: string[];
}

export interface MemberInput {
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    birthday: string;
    deathday: string | null;
    email: string | null;
    address: string[] | null;
    phones: Partial<Record<PhoneType, string>> | null;
}

export const ROOT = '00000000-0000-0000-0000-000000000000';
export const MARY = '00000000-0000-4000-8000-000000000001';
export const JOHN = '00000000-0000-4000-8000-000000000002';
export const LINDA = '00000000-0000-4000-8000-000000000003';
export const SUSAN = '00000000-0000-4000-8000-000000000004';
export const MICHAEL = '00000000-0000-4000-8000-000000000005';
export const EMILY = '00000000-0000-4000-8000-000000000006';
export const DANIEL = '00000000-0000-4000-8000-000000000007';

export function seedMembers(): Member[] {
    return [
        {
            id: ROOT, familyId: ROOT, firstName: 'Robert', middleName: 'James', lastName: 'Doe', suffix: 'Sr',
            birthday: '1940-03-15', deathday: '2015-11-02',
        },
        {
            id: MARY, familyId: ROOT, firstName: 'Mary', middleName: 'Ann', lastName: 'Doe',
            birthday: '1942-07-04', email: 'mary.doe@example.com',
            phones: { LANDLINE: '+1 312 555 0101' },
            address: ['100 Oak Street', 'Springfield, IL 62701'],
        },
        {
            id: JOHN, familyId: JOHN, firstName: 'John', middleName: 'Robert', lastName: 'Doe',
            birthday: '1965-01-20', email: 'john.doe@example.com',
            phones: { MOBILE: '+1 312 555 0102', LANDLINE: '+1 312-555-0103' },
            address: ['200 Elm Avenue', 'Apt 4B', 'Chicago, IL 60601'],
        },
        {
            id: LINDA, familyId: JOHN, firstName: 'Linda', lastName: 'Doe',
            birthday: '1966-04-12', email: 'linda.doe@example.com',
            phones: { MOBILE: '+1 312 555 0104' },
        },
        {
            id: SUSAN, familyId: SUSAN, firstName: 'Susan', lastName: 'Doe',
            birthday: '1968-09-09',
            phones: { LANDLINE: '+1 415 555 0105' },
            address: ['300 Pine Road', 'San Francisco, CA 94102'],
        },
        { id: MICHAEL, familyId: MICHAEL, firstName: 'Michael', lastName: 'Doe', birthday: '2005-05-01' },
        { id: EMILY, familyId: EMILY, firstName: 'Emily', lastName: 'Doe', birthday: '2010-08-30' },
        { id: DANIEL, familyId: DANIEL, firstName: 'Daniel', lastName: 'Doe', suffix: 'Jr', birthday: '1995-02-14' },
    ];
}

export function seedFamilies(): Family[] {
    return [
        { id: ROOT, ancestor: ROOT, spouse: MARY, descendants: [SUSAN, JOHN] },
        { id: JOHN, ancestor: ROOT, spouse: LINDA, descendants: [EMILY, MICHAEL, DANIEL] },
        { id: SUSAN, ancestor: ROOT },
        { id: MICHAEL, ancestor: JOHN },
        { id: EMILY, ancestor: JOHN },
        { id: DANIEL, ancestor: JOHN },
    ];
}

export class NotFound extends Error {}

export class FamilyStore {
    readonly members = new Map<string, Member>();
    readonly families = new Map<string, Family>();
    readonly admins = new Set<string>();
    private nextId = 1;

    constructor(members: Member[] = seedMembers(), families: Family[] = seedFamilies()) {
        members.forEach(m => this.members.set(m.id, m));
        families.forEach(f => this.families.set(f.id, f));
    }

    member(id: string): Member {
        const member = this.members.get(id);
        if (!member) {
            throw new NotFound(id);
        }
        return member;
    }

    family(id: string): Family {
        const family = this.families.get(id);
        if (!family) {
            throw new NotFound(id);
        }
        return family;
    }

    getResponse(requestedId: string): Record<string, unknown> {
        const member = this.member(requestedId);
        const family = this.family(member.familyId);
        const body: Record<string, unknown> = { ancestor: family.ancestor, member };
        if (member.id === member.familyId) {
            if (family.spouse) {
                body.spouse = this.member(family.spouse);
            }
        } else {
            body.spouse = this.member(family.id);
        }
        if (family.descendants?.length) {
            body.descendants = family.descendants
                .map(id => this.member(id))
                .sort((a, b) => a.birthday.localeCompare(b.birthday));
        }
        body.memberIsAdmin = this.admins.has(member.id);
        return body;
    }

    create(callerId: string, request: { member: MemberInput; isSpouse: boolean; ancestor?: string | null }): Member {
        const caller = this.member(callerId);
        const target = this.admins.has(callerId) && request.ancestor
            ? this.family(request.ancestor)
            : this.family(caller.familyId);
        const id = `11111111-0000-4000-8000-${String(this.nextId++).padStart(12, '0')}`;
        const member = { id, familyId: request.isSpouse ? target.id : id, ...fromInput(request.member) };
        this.members.set(id, member);
        if (request.isSpouse) {
            target.spouse = id;
        } else {
            target.descendants = [...(target.descendants ?? []), id];
            this.families.set(id, { id, ancestor: target.id });
        }
        return member;
    }

    update(request: { id: string; member: MemberInput }): void {
        const existing = this.member(request.id);
        this.members.set(request.id, { id: existing.id, familyId: existing.familyId, ...fromInput(request.member) });
    }

    delete(request: { id: string }): void {
        const member = this.member(request.id);
        const family = this.family(member.familyId);
        if (member.id === member.familyId) {
            const parent = this.family(family.ancestor);
            parent.descendants = parent.descendants?.filter(id => id !== member.id);
            this.families.delete(member.id);
        } else {
            delete family.spouse;
        }
        this.members.delete(member.id);
    }
}

function fromInput(input: MemberInput): Omit<Member, 'id' | 'familyId'> {
    const member: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
        if (value !== null) {
            member[key] = value;
        }
    }
    return member as Omit<Member, 'id' | 'familyId'>;
}
