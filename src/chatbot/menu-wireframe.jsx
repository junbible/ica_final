import React, { useState } from 'react';

// 메뉴 트리 데이터 구조
const menuTreeData = {
  main: {
    title: "메인 컨디션",
    options: [
      { id: "tired", icon: "😫", label: "피곤해요", color: "#6B7FD7" },
      { id: "hangover", icon: "🍺", label: "숙취있어요", color: "#D76B6B" },
      { id: "stress", icon: "😤", label: "스트레스", color: "#D7A56B" },
      { id: "cold", icon: "🤧", label: "감기기운", color: "#6BD7A5" },
      { id: "hearty", icon: "💪", label: "든든하게", color: "#D76BB5" },
      { id: "light", icon: "🥗", label: "가볍게", color: "#7DD76B" }
    ]
  },
  sub: {
    tired: [
      { id: "meat", icon: "🍖", label: "고기로 충전" },
      { id: "soup", icon: "🍜", label: "뜨끈한 국물" },
      { id: "sweet", icon: "🍰", label: "달달한 보상" },
      { id: "light_recover", icon: "🥗", label: "가볍게 회복" }
    ],
    hangover: [
      { id: "hot_soup", icon: "🍲", label: "뜨끈한 해장" },
      { id: "cool", icon: "🍜", label: "시원한 것" },
      { id: "mild", icon: "🥣", label: "속 편한 것" },
      { id: "spicy_soup", icon: "🌶️", label: "얼큰한 것" }
    ],
    stress: [
      { id: "spicy", icon: "🔥", label: "매운 걸로" },
      { id: "sweet_stress", icon: "🍫", label: "달달한 걸로" },
      { id: "meat_stress", icon: "🥩", label: "고기가 땡겨" },
      { id: "crispy", icon: "🍗", label: "바삭한 걸로" }
    ],
    cold: [
      { id: "warm_soup", icon: "🍲", label: "따뜻한 국물" },
      { id: "soft", icon: "🥣", label: "부드러운 것" },
      { id: "vitamin", icon: "🍊", label: "비타민 충전" },
      { id: "healthy", icon: "🐔", label: "몸보신" }
    ],
    hearty: [
      { id: "meat_hearty", icon: "🥩", label: "고기" },
      { id: "rice_soup", icon: "🍚", label: "밥 + 국" },
      { id: "noodle", icon: "🍝", label: "면" },
      { id: "snack", icon: "🍱", label: "분식" }
    ],
    light: [
      { id: "salad", icon: "🥗", label: "샐러드" },
      { id: "korean_light", icon: "🥬", label: "담백한 한식" },
      { id: "simple", icon: "🥪", label: "간단히" },
      { id: "light_soup", icon: "🥣", label: "국물 있게" }
    ]
  }
};

// 샘플 추천 결과
const sampleResults = [
  { id: 1, name: "신선설농탕 강남점", rating: 4.5, distance: "350m", category: "한식 · 설렁탕", tags: ["든든", "뜨끈한국물"], review: "국물이 진하고 정말 든든해요" },
  { id: 2, name: "하동관 강남", rating: 4.3, distance: "500m", category: "한식 · 곰탕", tags: ["깔끔", "담백"], review: "피곤할 때 먹으면 힘이 나요" },
  { id: 3, name: "본가 순대국", rating: 4.4, distance: "420m", category: "한식 · 순대국", tags: ["푸짐", "가성비"], review: "양도 많고 속이 든든해집니다" }
];

export default function MenuWireframe() {
  const [currentView, setCurrentView] = useState('tree'); // tree, wireframe
  const [wireframeStep, setWireframeStep] = useState(0); // 0: 랜딩, 1: 챗봇, 2: 컨디션선택, 3: 세부선택, 4: 로딩, 5: 결과, 6: 회원가입, 7: 선호도
  const [selectedCondition, setSelectedCondition] = useState(null);

  // 메뉴 트리 뷰
  const MenuTreeView = () => (
    <div style={{ padding: '40px', background: '#0D0D0D', minHeight: '100vh' }}>
      <h1 style={{ 
        fontFamily: 'Pretendard, sans-serif', 
        fontSize: '32px', 
        color: '#FFFFFF',
        marginBottom: '16px',
        fontWeight: '700'
      }}>
        📋 전체 메뉴 트리
      </h1>
      <p style={{ color: '#888', marginBottom: '40px', fontSize: '14px' }}>
        컨디션 기반 메뉴 추천 서비스의 전체 화면 구조
      </p>

      {/* 메인 플로우 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 레벨 0: 진입점 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
          borderRadius: '16px', 
          padding: '24px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6B7FD7', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
            LEVEL 0 · 진입점
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <FlowBox title="랜딩 페이지" desc="서비스 소개 + FAB 버튼" color="#4ECDC4" />
            <Arrow />
            <FlowBox title="회원가입 (선택)" desc="닉네임 + 선호도 설문" color="#FFE66D" />
          </div>
        </div>

        {/* 레벨 1: 챗봇 진입 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
          borderRadius: '16px', 
          padding: '24px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6B7FD7', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
            LEVEL 1 · 챗봇 시작
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <FlowBox title="FAB 클릭" desc="우측 하단 플로팅 버튼" color="#FF6B6B" />
            <Arrow />
            <FlowBox title="챗봇 모달 오픈" desc="봇 인사말 출력" color="#4ECDC4" />
            <Arrow />
            <FlowBox title="컨디션 선택" desc="6가지 메인 옵션" color="#95E1D3" isMain />
          </div>
        </div>

        {/* 레벨 2: 메인 컨디션 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
          borderRadius: '16px', 
          padding: '24px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6B7FD7', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
            LEVEL 2 · 메인 컨디션 (6개)
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {menuTreeData.main.options.map(opt => (
              <ConditionBox key={opt.id} icon={opt.icon} label={opt.label} color={opt.color} />
            ))}
          </div>
        </div>

        {/* 레벨 3: 세부 옵션 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
          borderRadius: '16px', 
          padding: '24px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6B7FD7', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
            LEVEL 3 · 세부 옵션 (컨디션별 4개씩)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(menuTreeData.sub).map(([key, options]) => {
              const mainOpt = menuTreeData.main.options.find(o => o.id === key);
              return (
                <div key={key} style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  border: `1px solid ${mainOpt.color}30`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '12px',
                    color: mainOpt.color,
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <span>{mainOpt.icon}</span>
                    <span>{mainOpt.label}</span>
                    <span style={{ color: '#666' }}>선택 시 →</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {options.map(sub => (
                      <SubOptionBox key={sub.id} icon={sub.icon} label={sub.label} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 레벨 4: 결과 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
          borderRadius: '16px', 
          padding: '24px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6B7FD7', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
            LEVEL 4 · 결과 및 액션
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <FlowBox title="로딩" desc="1-2초 애니메이션" color="#FFE66D" />
            <Arrow />
            <FlowBox title="추천 결과" desc="가게 카드 3-5개" color="#4ECDC4" isMain />
            <Arrow />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <FlowBox title="가게 상세" desc="클릭 시 정보 보기" color="#95E1D3" small />
              <FlowBox title="다시 선택" desc="처음으로 돌아가기" color="#FF6B6B" small />
              <FlowBox title="다른 추천" desc="목록 갱신" color="#DDA0DD" small />
            </div>
          </div>
        </div>

        {/* 회원 관련 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2d1f1f 0%, #1f2d1f 100%)', 
          borderRadius: '16px', 
          padding: '24px',
          border: '1px solid #444'
        }}>
          <div style={{ color: '#FFE66D', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
            OPTIONAL · 회원 플로우
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <FlowBox title="회원가입" desc="닉네임 입력" color="#FFE66D" />
            <Arrow />
            <FlowBox title="선호도 설문" desc="4-5개 질문" color="#FFE66D" />
            <Arrow />
            <FlowBox title="완료" desc="메인으로 이동" color="#4ECDC4" />
          </div>
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,230,109,0.1)', borderRadius: '8px' }}>
            <div style={{ color: '#FFE66D', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              📝 선호도 설문 항목
            </div>
            <div style={{ color: '#999', fontSize: '12px', lineHeight: '1.8' }}>
              1. 선호 음식 종류 (한식/중식/일식/양식/분식) - 복수선택<br/>
              2. 매운 음식 선호도 (못먹음/보통/좋아함)<br/>
              3. 식사 스타일 (혼밥/같이)<br/>
              4. 선호 가격대 (1만원이하/1-2만원/상관없음)
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // 와이어프레임 뷰
  const WireframeView = () => (
    <div style={{ 
      padding: '40px', 
      background: '#0D0D0D', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h1 style={{ 
        fontFamily: 'Pretendard, sans-serif', 
        fontSize: '32px', 
        color: '#FFFFFF',
        marginBottom: '16px',
        fontWeight: '700'
      }}>
        📱 와이어프레임
      </h1>
      <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
        화면을 클릭하여 다음 단계로 이동
      </p>

      {/* 단계 네비게이션 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['랜딩', '챗봇열림', '컨디션선택', '세부선택', '로딩', '결과', '회원가입', '선호도설문'].map((step, idx) => (
          <button
            key={idx}
            onClick={() => setWireframeStep(idx)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: wireframeStep === idx ? '#4ECDC4' : '#333',
              color: wireframeStep === idx ? '#000' : '#888',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {step}
          </button>
        ))}
      </div>

      {/* 모바일 프레임 */}
      <div 
        onClick={() => setWireframeStep((prev) => (prev + 1) % 8)}
        style={{
          width: '375px',
          height: '812px',
          background: '#FFFFFF',
          borderRadius: '40px',
          padding: '12px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 노치 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '30px',
          background: '#000',
          borderRadius: '20px',
          zIndex: 100
        }} />

        {/* 화면 내용 */}
        <div style={{
          width: '100%',
          height: '100%',
          background: '#FAFAFA',
          borderRadius: '32px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {wireframeStep === 0 && <LandingScreen />}
          {wireframeStep === 1 && <ChatOpenScreen />}
          {wireframeStep === 2 && <ConditionSelectScreen />}
          {wireframeStep === 3 && <SubSelectScreen />}
          {wireframeStep === 4 && <LoadingScreen />}
          {wireframeStep === 5 && <ResultScreen />}
          {wireframeStep === 6 && <SignupScreen />}
          {wireframeStep === 7 && <PreferenceScreen />}
        </div>
      </div>

      <p style={{ color: '#666', marginTop: '24px', fontSize: '12px' }}>
        클릭하면 다음 화면으로 →
      </p>
    </div>
  );

  // 개별 화면 컴포넌트들
  const LandingScreen = () => (
    <div style={{ 
      height: '100%', 
      background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFFFF 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* 헤더 */}
      <div style={{ padding: '60px 24px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          오늘 뭐 먹지?
        </h1>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          컨디션에 딱 맞는<br/>오늘의 한 끼를 찾아드려요
        </p>
      </div>

      {/* 일러스트 영역 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '24px'
      }}>
        <div style={{ 
          width: '200px', 
          height: '200px', 
          background: '#F0F0F0', 
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '80px'
        }}>
          🤔
        </div>
      </div>

      {/* 하단 안내 */}
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#999' }}>
          우측 하단 버튼을 눌러 시작하세요
        </p>
      </div>

      {/* FAB 버튼 */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        right: '24px',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(255,107,107,0.4)',
        fontSize: '24px'
      }}>
        💬
      </div>

      {/* 툴팁 */}
      <div style={{
        position: 'absolute',
        bottom: '170px',
        right: '24px',
        background: '#333',
        color: '#FFF',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        whiteSpace: 'nowrap'
      }}>
        점심 추천받기 👆
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          right: '24px',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #333'
        }} />
      </div>
    </div>
  );

  const ChatOpenScreen = () => (
    <div style={{ 
      height: '100%', 
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 챗봇 헤더 */}
      <div style={{ 
        background: '#FFFFFF',
        padding: '60px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #EEE'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '20px'
        }}>
          🍽️
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
            오늘뭐먹지 봇
          </div>
          <div style={{ fontSize: '11px', color: '#4CAF50' }}>● 응답 가능</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '20px', color: '#999' }}>✕</div>
      </div>

      {/* 채팅 영역 */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* 봇 메시지 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            flexShrink: 0
          }}>
            🍽️
          </div>
          <div style={{
            background: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '4px 16px 16px 16px',
            maxWidth: '80%',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', margin: 0 }}>
              안녕하세요! 👋<br/><br/>
              오늘 컨디션은 어떠세요?<br/>
              상태에 맞는 메뉴를 추천해드릴게요.
            </p>
          </div>
        </div>

        {/* 타이핑 인디케이터 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px'
          }}>
            🍽️
          </div>
          <div style={{
            background: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '4px 16px 16px 16px',
            display: 'flex',
            gap: '4px'
          }}>
            <div style={{ width: '8px', height: '8px', background: '#CCC', borderRadius: '50%' }} />
            <div style={{ width: '8px', height: '8px', background: '#CCC', borderRadius: '50%' }} />
            <div style={{ width: '8px', height: '8px', background: '#CCC', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );

  const ConditionSelectScreen = () => (
    <div style={{ 
      height: '100%', 
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 챗봇 헤더 */}
      <div style={{ 
        background: '#FFFFFF',
        padding: '60px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #EEE'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '20px'
        }}>
          🍽️
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
            오늘뭐먹지 봇
          </div>
          <div style={{ fontSize: '11px', color: '#4CAF50' }}>● 응답 가능</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '20px', color: '#999' }}>✕</div>
      </div>

      {/* 채팅 영역 */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* 봇 메시지 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            flexShrink: 0
          }}>
            🍽️
          </div>
          <div style={{
            background: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '4px 16px 16px 16px',
            maxWidth: '80%',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', margin: 0 }}>
              오늘 컨디션이 어떠세요? 🤔
            </p>
          </div>
        </div>
      </div>

      {/* 선택 옵션 */}
      <div style={{ 
        padding: '16px 20px 40px',
        background: '#FFFFFF',
        borderTop: '1px solid #EEE'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '10px'
        }}>
          {menuTreeData.main.options.map(opt => (
            <button
              key={opt.id}
              style={{
                padding: '14px 8px',
                background: '#FAFAFA',
                border: '1px solid #EEE',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '24px' }}>{opt.icon}</span>
              <span style={{ fontSize: '12px', color: '#333', fontWeight: '500' }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const SubSelectScreen = () => (
    <div style={{ 
      height: '100%', 
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 챗봇 헤더 */}
      <div style={{ 
        background: '#FFFFFF',
        padding: '60px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #EEE'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '20px'
        }}>
          🍽️
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
            오늘뭐먹지 봇
          </div>
          <div style={{ fontSize: '11px', color: '#4CAF50' }}>● 응답 가능</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '20px', color: '#999' }}>✕</div>
      </div>

      {/* 채팅 영역 */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* 사용자 선택 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            padding: '10px 16px',
            borderRadius: '16px 16px 4px 16px',
            color: '#FFF',
            fontSize: '14px'
          }}>
            😫 피곤해요
          </div>
        </div>

        {/* 봇 응답 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            flexShrink: 0
          }}>
            🍽️
          </div>
          <div style={{
            background: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '4px 16px 16px 16px',
            maxWidth: '80%',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', margin: 0 }}>
              고생하셨어요 😢<br/>
              피곤할 땐 어떤 게 끌리세요?
            </p>
          </div>
        </div>
      </div>

      {/* 세부 선택 옵션 */}
      <div style={{ 
        padding: '16px 20px 40px',
        background: '#FFFFFF',
        borderTop: '1px solid #EEE'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '10px'
        }}>
          {menuTreeData.sub.tired.map(opt => (
            <button
              key={opt.id}
              style={{
                padding: '14px 12px',
                background: '#FAFAFA',
                border: '1px solid #EEE',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '22px' }}>{opt.icon}</span>
              <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>{opt.label}</span>
            </button>
          ))}
        </div>
        <button style={{
          width: '100%',
          marginTop: '12px',
          padding: '10px',
          background: 'transparent',
          border: '1px dashed #CCC',
          borderRadius: '8px',
          color: '#999',
          fontSize: '12px',
          cursor: 'pointer'
        }}>
          ← 다시 선택하기
        </button>
      </div>
    </div>
  );

  const LoadingScreen = () => (
    <div style={{ 
      height: '100%', 
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 챗봇 헤더 */}
      <div style={{ 
        background: '#FFFFFF',
        padding: '60px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #EEE'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '20px'
        }}>
          🍽️
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
            오늘뭐먹지 봇
          </div>
          <div style={{ fontSize: '11px', color: '#4CAF50' }}>● 응답 가능</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '20px', color: '#999' }}>✕</div>
      </div>

      {/* 채팅 영역 */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* 이전 대화들 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            padding: '10px 16px',
            borderRadius: '16px 16px 4px 16px',
            color: '#FFF',
            fontSize: '14px'
          }}>
            😫 피곤해요
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            padding: '10px 16px',
            borderRadius: '16px 16px 4px 16px',
            color: '#FFF',
            fontSize: '14px'
          }}>
            🍜 뜨끈한 국물
          </div>
        </div>

        {/* 로딩 메시지 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            flexShrink: 0
          }}>
            🍽️
          </div>
          <div style={{
            background: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '4px 16px 16px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '32px' }}>🔍</div>
            <p style={{ fontSize: '13px', color: '#666', margin: 0, textAlign: 'center' }}>
              강남역 근처에서<br/>
              <strong style={{ color: '#FF6B6B' }}>뜨끈한 국물</strong> 맛집 찾는 중...
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', background: '#FF6B6B', borderRadius: '50%' }} />
              <div style={{ width: '6px', height: '6px', background: '#FFB6B6', borderRadius: '50%' }} />
              <div style={{ width: '6px', height: '6px', background: '#FFE0E0', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultScreen = () => (
    <div style={{ 
      height: '100%', 
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 챗봇 헤더 */}
      <div style={{ 
        background: '#FFFFFF',
        padding: '60px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #EEE'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '20px'
        }}>
          🍽️
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
            오늘뭐먹지 봇
          </div>
          <div style={{ fontSize: '11px', color: '#4CAF50' }}>● 응답 가능</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '20px', color: '#999' }}>✕</div>
      </div>

      {/* 채팅 영역 */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* 봇 결과 메시지 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            flexShrink: 0
          }}>
            🍽️
          </div>
          <div style={{
            background: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '4px 16px 16px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', margin: 0 }}>
              피곤할 때 딱 좋은<br/>
              <strong style={{ color: '#FF6B6B' }}>뜨끈한 국물</strong> 맛집이에요! 🍜
            </p>
          </div>
        </div>

        {/* 결과 카드들 */}
        <div style={{ marginLeft: '40px' }}>
          {sampleResults.map((result, idx) => (
            <div 
              key={result.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                    {result.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {result.category} · {result.distance}
                  </div>
                </div>
                <div style={{ 
                  background: '#FFF9E6', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#F5A623'
                }}>
                  ⭐ {result.rating}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {result.tags.map(tag => (
                  <span key={tag} style={{
                    background: '#FFE8E8',
                    color: '#FF6B6B',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                fontStyle: 'italic',
                background: '#F9F9F9',
                padding: '8px 10px',
                borderRadius: '6px',
                borderLeft: '3px solid #FF6B6B'
              }}>
                "{result.review}"
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button style={{
                  flex: 1,
                  padding: '10px',
                  background: '#FF6B6B',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  지도에서 보기 📍
                </button>
                <button style={{
                  padding: '10px 16px',
                  background: '#F5F5F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#666',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  공유
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 액션 */}
      <div style={{ 
        padding: '16px 20px 40px',
        background: '#FFFFFF',
        borderTop: '1px solid #EEE',
        display: 'flex',
        gap: '10px'
      }}>
        <button style={{
          flex: 1,
          padding: '14px',
          background: '#F5F5F5',
          border: 'none',
          borderRadius: '12px',
          color: '#666',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          🔄 다른 추천
        </button>
        <button style={{
          flex: 1,
          padding: '14px',
          background: '#F5F5F5',
          border: 'none',
          borderRadius: '12px',
          color: '#666',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          🏠 처음으로
        </button>
      </div>
    </div>
  );

  const SignupScreen = () => (
    <div style={{ 
      height: '100%', 
      background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFFFF 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '60px 24px 40px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          반가워요!
        </h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          간단한 정보만 알려주시면<br/>더 맞춤된 추천을 해드릴게요
        </p>
      </div>

      <div style={{ flex: 1 }}>
        {/* 닉네임 입력 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
            닉네임
          </label>
          <input
            type="text"
            placeholder="어떻게 불러드릴까요?"
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 성별 선택 (선택) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
            성별 <span style={{ color: '#999', fontWeight: '400' }}>(선택)</span>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['남성', '여성', '선택안함'].map(opt => (
              <button
                key={opt}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: opt === '선택안함' ? '#FF6B6B' : '#F5F5F5',
                  border: 'none',
                  borderRadius: '10px',
                  color: opt === '선택안함' ? '#FFF' : '#666',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 나이대 선택 (선택) */}
        <div>
          <label style={{ fontSize: '13px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
            나이대 <span style={{ color: '#999', fontWeight: '400' }}>(선택)</span>
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['10대', '20대', '30대', '40대', '50대+'].map(opt => (
              <button
                key={opt}
                style={{
                  padding: '10px 16px',
                  background: '#F5F5F5',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#666',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div>
        <button style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          border: 'none',
          borderRadius: '14px',
          color: '#FFF',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '12px'
        }}>
          다음 단계로 →
        </button>
        <button style={{
          width: '100%',
          padding: '14px',
          background: 'transparent',
          border: 'none',
          color: '#999',
          fontSize: '13px',
          cursor: 'pointer'
        }}>
          건너뛰기
        </button>
      </div>
    </div>
  );

  const PreferenceScreen = () => (
    <div style={{ 
      height: '100%', 
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 헤더 */}
      <div style={{ 
        padding: '60px 24px 20px',
        borderBottom: '1px solid #F0F0F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            취향 설문
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
          4가지만 알려주세요 (1분 소요)
        </p>
        {/* 진행 바 */}
        <div style={{ 
          marginTop: '16px',
          height: '4px',
          background: '#F0F0F0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{ width: '25%', height: '100%', background: '#FF6B6B' }} />
        </div>
      </div>

      {/* 질문 영역 */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        
        {/* Q1 */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: '#1a1a1a', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              background: '#FF6B6B', 
              color: '#FFF', 
              width: '22px', 
              height: '22px', 
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: '700'
            }}>1</span>
            어떤 음식을 좋아하세요?
            <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>(복수선택)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { icon: '🍚', label: '한식' },
              { icon: '🥟', label: '중식' },
              { icon: '🍣', label: '일식' },
              { icon: '🍝', label: '양식' },
              { icon: '🍱', label: '분식' }
            ].map(opt => (
              <button
                key={opt.label}
                style={{
                  padding: '10px 16px',
                  background: opt.label === '한식' || opt.label === '일식' ? '#FFE8E8' : '#F5F5F5',
                  border: opt.label === '한식' || opt.label === '일식' ? '1px solid #FF6B6B' : '1px solid transparent',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Q2 */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: '#1a1a1a', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              background: '#FFE0E0', 
              color: '#FF6B6B', 
              width: '22px', 
              height: '22px', 
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: '700'
            }}>2</span>
            매운 음식은요?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['🙅 못 먹어요', '😐 보통이요', '🔥 좋아해요'].map(opt => (
              <button
                key={opt}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: '#F5F5F5',
                  border: '1px solid transparent',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q3 */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: '#1a1a1a', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              background: '#FFE0E0', 
              color: '#FF6B6B', 
              width: '22px', 
              height: '22px', 
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: '700'
            }}>3</span>
            보통 어떻게 식사하세요?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['🧑 혼밥 많아요', '👥 같이 먹어요'].map(opt => (
              <button
                key={opt}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F5F5F5',
                  border: '1px solid transparent',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q4 */}
        <div>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: '#1a1a1a', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              background: '#FFE0E0', 
              color: '#FF6B6B', 
              width: '22px', 
              height: '22px', 
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: '700'
            }}>4</span>
            선호하는 가격대는요?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['💰 1만원 이하', '💵 1-2만원', '💎 상관없어요'].map(opt => (
              <button
                key={opt}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: '#F5F5F5',
                  border: '1px solid transparent',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 하단 버튼 */}
      <div style={{ padding: '16px 24px 40px' }}>
        <button style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          border: 'none',
          borderRadius: '14px',
          color: '#FFF',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          완료! 추천 시작하기 🎉
        </button>
      </div>
    </div>
  );

  // 보조 컴포넌트들
  const FlowBox = ({ title, desc, color, isMain, small }) => (
    <div style={{
      background: `${color}15`,
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      padding: small ? '10px 14px' : '16px 20px',
      minWidth: small ? '120px' : '140px'
    }}>
      <div style={{ 
        fontSize: small ? '13px' : '14px', 
        fontWeight: '600', 
        color: color,
        marginBottom: '4px'
      }}>
        {title}
      </div>
      <div style={{ fontSize: '11px', color: '#888' }}>{desc}</div>
    </div>
  );

  const Arrow = () => (
    <div style={{ color: '#555', fontSize: '20px', display: 'flex', alignItems: 'center' }}>→</div>
  );

  const ConditionBox = ({ icon, label, color }) => (
    <div style={{
      background: `${color}20`,
      border: `1px solid ${color}50`,
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '110px'
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ fontSize: '13px', color: '#FFF', fontWeight: '500' }}>{label}</span>
    </div>
  );

  const SubOptionBox = ({ icon, label }) => (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ fontSize: '12px', color: '#CCC' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
      {/* 상단 탭 */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: '#1a1a1a', 
        padding: '16px 24px',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        borderBottom: '1px solid #333'
      }}>
        <button
          onClick={() => setCurrentView('tree')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: currentView === 'tree' ? '#4ECDC4' : '#333',
            color: currentView === 'tree' ? '#000' : '#888',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📋 메뉴 트리
        </button>
        <button
          onClick={() => setCurrentView('wireframe')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: currentView === 'wireframe' ? '#4ECDC4' : '#333',
            color: currentView === 'wireframe' ? '#000' : '#888',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📱 와이어프레임
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ marginTop: '60px' }}>
        {currentView === 'tree' ? <MenuTreeView /> : <WireframeView />}
      </div>
    </div>
  );
}
