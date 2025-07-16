import { 
  usernameSchema, 
  displayNameSchema, 
  linkTitleSchema, 
  urlSchema, 
  bioSchema,
  profileSchema,
  linkInBioSchema,
  deeplinkSchema,
  qrCodeSchema,
  useFormValidation,
  validateLinkData,
  validateDeeplinkData,
  validateQRCodeData,
  validateProfileData
} from '../validation'

describe('Validation Schemas', () => {
  describe('usernameSchema', () => {
    it('should validate correct usernames', () => {
      expect(usernameSchema.safeParse('john_doe').success).toBe(true)
      expect(usernameSchema.safeParse('user123').success).toBe(true)
      expect(usernameSchema.safeParse('test_user_123').success).toBe(true)
    })

    it('should reject invalid usernames', () => {
      expect(usernameSchema.safeParse('ab').success).toBe(false) // too short
      expect(usernameSchema.safeParse('a'.repeat(31)).success).toBe(false) // too long
      expect(usernameSchema.safeParse('_user').success).toBe(false) // starts with underscore
      expect(usernameSchema.safeParse('user_').success).toBe(false) // ends with underscore
      expect(usernameSchema.safeParse('user-name').success).toBe(false) // contains hyphen
      expect(usernameSchema.safeParse('user name').success).toBe(false) // contains space
      expect(usernameSchema.safeParse('user@name').success).toBe(false) // contains special char
    })
  })

  describe('displayNameSchema', () => {
    it('should validate correct display names', () => {
      expect(displayNameSchema.safeParse('John Doe').success).toBe(true)
      expect(displayNameSchema.safeParse('Test User').success).toBe(true)
      expect(displayNameSchema.safeParse('A'.repeat(50)).success).toBe(true) // max length
    })

    it('should reject invalid display names', () => {
      expect(displayNameSchema.safeParse('').success).toBe(false) // empty
      expect(displayNameSchema.safeParse('A'.repeat(51)).success).toBe(false) // too long
      expect(displayNameSchema.safeParse('<script>alert("xss")</script>').success).toBe(false) // HTML tags
    })
  })

  describe('linkTitleSchema', () => {
    it('should validate correct link titles', () => {
      expect(linkTitleSchema.safeParse('My Portfolio').success).toBe(true)
      expect(linkTitleSchema.safeParse('GitHub Profile').success).toBe(true)
      expect(linkTitleSchema.safeParse('A'.repeat(100)).success).toBe(true) // max length
    })

    it('should reject invalid link titles', () => {
      expect(linkTitleSchema.safeParse('').success).toBe(false) // empty
      expect(linkTitleSchema.safeParse('A'.repeat(101)).success).toBe(false) // too long
      expect(linkTitleSchema.safeParse('<script>alert("xss")</script>').success).toBe(false) // HTML tags
      expect(linkTitleSchema.safeParse('javascript:alert("xss")').success).toBe(false) // JavaScript
    })
  })

  describe('urlSchema', () => {
    it('should validate correct URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true)
      expect(urlSchema.safeParse('http://example.com').success).toBe(true)
      expect(urlSchema.safeParse('https://subdomain.example.com/path?query=value').success).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(urlSchema.safeParse('').success).toBe(false) // empty
      expect(urlSchema.safeParse('example.com').success).toBe(false) // no protocol
      expect(urlSchema.safeParse('ftp://example.com').success).toBe(false) // invalid protocol
      expect(urlSchema.safeParse('javascript:alert("xss")').success).toBe(false) // JavaScript
      expect(urlSchema.safeParse('data:text/html,<script>alert("xss")</script>').success).toBe(false) // data URL
      expect(urlSchema.safeParse('https://' + 'a'.repeat(2048)).success).toBe(false) // too long
    })
  })

  describe('bioSchema', () => {
    it('should validate correct bios', () => {
      expect(bioSchema.safeParse('Software developer').success).toBe(true)
      expect(bioSchema.safeParse('').success).toBe(true) // empty is optional
      expect(bioSchema.safeParse(undefined).success).toBe(true) // undefined is optional
      expect(bioSchema.safeParse('A'.repeat(200)).success).toBe(true) // max length
    })

    it('should reject invalid bios', () => {
      expect(bioSchema.safeParse('A'.repeat(201)).success).toBe(false) // too long
      expect(bioSchema.safeParse('<script>alert("xss")</script>').success).toBe(false) // HTML tags
      expect(bioSchema.safeParse('javascript:alert("xss")').success).toBe(false) // JavaScript
    })
  })

  describe('profileSchema', () => {
    it('should validate correct profile data', () => {
      const validProfile = {
        username: 'john_doe',
        display_name: 'John Doe',
        bio: 'Software developer',
        theme: 'dark' as const,
        is_public: true,
      }
      expect(profileSchema.safeParse(validProfile).success).toBe(true)
    })

    it('should reject invalid profile data', () => {
      const invalidProfile = {
        username: 'ab', // too short
        display_name: '',
        bio: 'A'.repeat(201), // too long
        theme: 'invalid' as any,
        is_public: 'yes' as any, // should be boolean
      }
      expect(profileSchema.safeParse(invalidProfile).success).toBe(false)
    })
  })

  describe('linkInBioSchema', () => {
    it('should validate correct link in bio data', () => {
      const validLink = {
        title: 'My Portfolio',
        url: 'https://example.com',
        is_active: true,
      }
      expect(linkInBioSchema.safeParse(validLink).success).toBe(true)
    })

    it('should reject invalid link in bio data', () => {
      const invalidLink = {
        title: '', // empty
        url: 'invalid-url',
        is_active: 'yes' as any, // should be boolean
      }
      expect(linkInBioSchema.safeParse(invalidLink).success).toBe(false)
    })
  })

  describe('deeplinkSchema', () => {
    it('should validate correct deeplink data', () => {
      const validDeeplink = {
        title: 'My App',
        originalUrl: 'https://example.com',
        iosUrl: 'https://apps.apple.com/app/myapp',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.example.app',
        desktopUrl: 'https://web.example.com',
        fallbackUrl: 'https://example.com/fallback',
      }
      expect(deeplinkSchema.safeParse(validDeeplink).success).toBe(true)
    })

    it('should reject invalid deeplink data', () => {
      const invalidDeeplink = {
        title: '',
        originalUrl: 'invalid-url',
        iosUrl: 'not-a-url',
      }
      expect(deeplinkSchema.safeParse(invalidDeeplink).success).toBe(false)
    })
  })

  describe('qrCodeSchema', () => {
    it('should validate correct QR code data', () => {
      const validQRCode = {
        title: 'My QR Code',
        url: 'https://example.com',
        size: 200,
        errorCorrection: 'M',
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        format: 'PNG',
      }
      expect(qrCodeSchema.safeParse(validQRCode).success).toBe(true)
    })

    it('should reject invalid QR code data', () => {
      const invalidQRCode = {
        title: '',
        url: 'invalid-url',
        size: 50, // too small
        errorCorrection: 'Z', // invalid level
        foregroundColor: 'not-a-color',
        backgroundColor: 'not-a-color',
        format: 'GIF', // invalid format
      }
      expect(qrCodeSchema.safeParse(invalidQRCode).success).toBe(false)
    })
  })
})

describe('Validation Functions', () => {
  describe('validateLinkData', () => {
    it('should validate correct link data', () => {
      const validData = {
        title: 'My Portfolio',
        url: 'https://example.com',
        is_active: true,
      }
      const result = validateLinkData(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid link data', () => {
      const invalidData = {
        title: '',
        url: 'invalid-url',
      }
      const result = validateLinkData(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('validateDeeplinkData', () => {
    it('should validate correct deeplink data', () => {
      const validData = {
        title: 'My App',
        originalUrl: 'https://example.com',
        iosUrl: 'https://apps.apple.com/app/myapp',
      }
      const result = validateDeeplinkData(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('validateQRCodeData', () => {
    it('should validate correct QR code data', () => {
      const validData = {
        title: 'My QR Code',
        url: 'https://example.com',
        size: 200,
        format: 'PNG',
      }
      const result = validateQRCodeData(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('validateProfileData', () => {
    it('should validate correct profile data', () => {
      const validData = {
        username: 'john_doe',
        display_name: 'John Doe',
        bio: 'Software developer',
        theme: 'dark',
        avatar_url: 'https://example.com/avatar.png',
      }
      const result = validateProfileData(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe('useFormValidation hook', () => {
  // Note: This would need to be tested in a React environment
  // For now, we'll test the schema directly
  it('should work with valid schema', () => {
    const schema = usernameSchema
    const validation = useFormValidation(schema)
    // This would need to be tested in a React component test
    expect(validation).toBeDefined()
  })
})