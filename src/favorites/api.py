"""즐겨찾기 API 라우터"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Favorite, User
from auth.dependencies import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


class FavoriteCreate(BaseModel):
    """즐겨찾기 추가 요청"""
    restaurant_id: str
    restaurant_name: str
    restaurant_image: Optional[str] = None
    restaurant_category: Optional[str] = None
    restaurant_rating: Optional[str] = None


class FavoriteResponse(BaseModel):
    """즐겨찾기 응답"""
    id: str
    restaurant_id: str
    restaurant_name: str
    restaurant_image: Optional[str]
    restaurant_category: Optional[str]
    restaurant_rating: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[FavoriteResponse])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """즐겨찾기 목록 조회"""
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()

    return [
        FavoriteResponse(
            id=f.id,
            restaurant_id=f.restaurant_id,
            restaurant_name=f.restaurant_name,
            restaurant_image=f.restaurant_image,
            restaurant_category=f.restaurant_category,
            restaurant_rating=f.restaurant_rating,
            created_at=f.created_at.isoformat()
        )
        for f in favorites
    ]


@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """즐겨찾기 추가"""
    # 이미 즐겨찾기에 있는지 확인
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == favorite.restaurant_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 즐겨찾기에 추가된 맛집입니다"
        )

    # 즐겨찾기 추가
    new_favorite = Favorite(
        user_id=current_user.id,
        restaurant_id=favorite.restaurant_id,
        restaurant_name=favorite.restaurant_name,
        restaurant_image=favorite.restaurant_image,
        restaurant_category=favorite.restaurant_category,
        restaurant_rating=favorite.restaurant_rating
    )

    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)

    return FavoriteResponse(
        id=new_favorite.id,
        restaurant_id=new_favorite.restaurant_id,
        restaurant_name=new_favorite.restaurant_name,
        restaurant_image=new_favorite.restaurant_image,
        restaurant_category=new_favorite.restaurant_category,
        restaurant_rating=new_favorite.restaurant_rating,
        created_at=new_favorite.created_at.isoformat()
    )


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    restaurant_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """즐겨찾기 삭제"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="즐겨찾기에 없는 맛집입니다"
        )

    db.delete(favorite)
    db.commit()


@router.get("/check/{restaurant_id}")
async def check_favorite(
    restaurant_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """즐겨찾기 여부 확인"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()

    return {"is_favorite": favorite is not None}
